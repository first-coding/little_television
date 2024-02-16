from fastapi import FastAPI, Request
import uvicorn, json, os, glob
from sqlalchemy import create_engine, text
import pymysql, difflib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from config import mysql_host, mysql_port, mysql_db, mysql_name, mysql_password

class mysql_handler:
    def __init__(self, mysql_name, mysql_password, mysql_host, mysql_port, mysql_db):
        self.mysql_name = mysql_name
        self.mysql_password = mysql_password
        self.mysql_host = mysql_host
        self.mysql_port = mysql_port
        self.mysql_db = mysql_db
        self.url = f'mysql+pymysql://{self.mysql_name}:{self.mysql_password}@{self.mysql_host}:{self.mysql_port}/{self.mysql_db}'
    
    def dataframe_sql(self, table, df):
        columns_string = '('+ ",".join(list(df.columns)) + ")"
        tuple_string = ",".join([str(tuple(x)) for x in df.itertuples(index=False)])
        for index, row in df.iterrows():
            row_string = ', '.join([f"{column}='{value}'" for column, value in row.items()])
        final_string = f"INSERT INTO {table} {columns_string} VALUES {tuple_string} ON DUPLICATE KEY UPDATE {row_string};"
        return final_string
    def search_data(self, table_name, user_id, *args):
        engine = create_engine(self.url)
        if len(args) > 0 :
            path = args[0]
            query_search = f"select * from {table_name} where user_id = '{user_id} and file_path = {path}'"
        else:
            query_search = f"select * from {table_name} where user_id = '{user_id}'"
        search_df = pd.read_sql_query(query_search, engine)
        return search_df
    
    def update_data(self, table_name, data):
        try:
            engine = create_engine(self.url).connect()
            data_df = pd.DataFrame(data)
            for i in range(len(data_df)):
                df_handle = data_df.iloc[[i]]
                insert_string = self.dataframe_sql(table_name, df_handle)
                result = engine.execute(text(insert_string))
                engine.commit()
            engine.close()       
            return True
        except Exception as e:
            print(e)
            return False
        
    def login(self,username,password):
        engine = create_engine(self.url)
        query_search = f"select * from user where user_id = '{username}' and password = '{password}'"
        search_df = pd.read_sql_query(query_search,engine)
        if len(search_df)>0:
            return True
        else:
            query_search_1 = f"select user_id from user where user_id = '{username}'"
            search_df_1 = pd.read_sql_query(query_search_1,engine)
            query_search_2 = f"select password from user where password = '{password}'"
            search_df_2 = pd.read_sql_query(query_search_2,engine)
            if len(search_df_1)==0:
                return "用户名不存在"
            elif len(search_df_2)==0:
                return "密码错误"
            else:
                return False    
    
    def register(self,tablename,data):
        engine = create_engine(self.url)
        query_search = f"select user_id from user where user_id = '{data['user_id'][0]}'"
        search_df = pd.read_sql_query(query_search,engine)
        if len(search_df)>0:
            return "用户名重复"
        else:
            try:
                engines = create_engine(self.url).connect()
                insert_string = f"INSERT INTO {tablename} (user_id,password) VALUES {data['user_id'][0],data['password'][0]}"
                result = engines.execute(text(insert_string))
                print(result)
                engines.commit()
                engines.close()
                query_search = f"select user_id from user where user_id = '{data['user_id'][0]}'"
                search_df = pd.read_sql_query(query_search,engine)
                if len(search_df)>0:
                    return True
                else:
                    return False
            except Exception as e:
                    print(e)
                    return False

def get_files(path):
    file_dict = {}
    files_list = glob.glob(os.path.join(path, '*'))
    for name in files_list:
        if os.path.isfile(name):
            file_type = name.split(".")[-1]
            file_dict.update({name: file_type})
    return file_dict
      
# 封装的代码：
class api:
    def __init__(self, mysql_instance):
        self.app = FastAPI()
        # 添加跨域中间件
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],  # 允许所有源，也可以指定允许的源
            allow_credentials=True,
            allow_methods=["*"],  # 允许所有 HTTP 方法
            allow_headers=["*"],  # 允许所有头部
        )
        self.mysql_instance = mysql_instance
        @self.app.post("/get_path")
        async def get_path(request: Request):
            json_raw = await request.json()
            path = json.loads(json.dumps(json_raw)).get("path")
            file_dict = get_files(path)
            file_names = list(file_dict.keys())
            types = list(file_dict.values())
            return {"file_names": file_names, "types": types}

        @self.app.post("/get_data")
        async def get_data(request: Request):
            json_raw = await request.json()
            json_middle = json.loads(json.dumps(json_raw))
            user_id = json_middle.get("user_id")
            table_name = json_middle.get("table")
            path = json_middle.get("path")
            if path :
                search_df = self.mysql_instance.search_data(table_name, user_id, path)
            else:
                search_df = self.mysql_instance.search_data(table_name, user_id)
            return json.loads(search_df.to_json(orient='records',force_ascii=False))

        @self.app.post("/update_data")
        async def update_data(request: Request):
            json_raw = await request.json()
            json_middle = json.loads(json.dumps(json_raw))
            data = json_middle.get("data")
            table_name = json_middle.get("table")
            judgement = self.mysql_instance.update_data(table_name, data)
            if judgement:
                return {"status": "success"}
            else:
                return {"status": "fail"}
            
        @self.app.post("/login")
        async def login(request:Request):
            json_raw = await request.json()
            json_middle = json.loads(json.dumps(json_raw))
            username = json_middle.get('user_id')
            password = json_middle.get('password')
            judgement = self.mysql_instance.login(username,password)
            if judgement==True:
                return {"status":"success"}
            else:
                if judgement=="用户名不存在":
                    return {"status": "用户名不存在"}
                elif judgement=="密码错误":
                    return {"status":"密码错误"}
                else:
                    return {"status":"fail"}
            
        @self.app.post("/register")
        async def register(request:Request):
            json_raw = await request.json()
            json_middle = json.loads(json.dumps(json_raw))
            password = json_middle.get('password')
            confirmpassword = json_middle.get('confirmpassword')
            if password!=confirmpassword:
                return {"status":"两次输入密码不一样"}
            else:
                del json_middle['confirmpassword']
                judgement = self.mysql_instance.register("user",json_middle)
                if judgement=="用户名重复":
                    return {"status": "用户名重复"}
                elif judgement:
                    return {"status":"success"}
                else:
                    return {"status": "fail"}
        @self.app.post("/search")
        async def search(request:Request):
            json_raw = await request.json()
            json_middle = json.loads(json.dumps(json_raw))
            search = json_middle.get('search_data')
            user_id = json_middle.get('user_id')
            search_df = self.mysql_instance.search_data("hitory", user_id)
            search_data = search_df['description'].values.tolist()
            res = difflib.get_close_matches(search, search_data, n=25, cutoff=0.4)
            result = search_df[search_df['description'].isin(res)]
            return json.loads(result.to_json(orient='records',force_ascii=False))
   
if __name__ == '__main__':
    # 未封装运行
    # uvicorn.run(app, host = "127.0.0.1", port = 8000)
    # 封装运行
    mysql_instance = mysql_handler(mysql_name, mysql_password, mysql_host, mysql_port, mysql_db)
    api_instance = api(mysql_instance)
    uvicorn.run(api_instance.app, host = "127.0.0.1", port = 8000)
