from fastapi import FastAPI, Request
import uvicorn, json, os, glob
from sqlalchemy import create_engine
import pymysql
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
    def search_data(self, table_name):
        engine = create_engine(self.url)
        query_search = f"select * from {table_name}"
        search_df = pd.read_sql_query(query_search, engine)
        return search_df
    
    def update_data(self, table_name, data):
        try:
            engine = create_engine(self.url)
            data_df = pd.DataFrame(data)
            data_df.to_sql(table_name, engine, if_exists='replace', index=False)
            return True
        except Exception as e:
            return False

def get_files(path):
    file_dict = {}
    files_list = glob.glob(os.path.join(path, '*'))
    for name in files_list:
        if os.path.isfile(name):
            file_type = name.split(".")[-1]
            file_dict.update({name: file_type})
    return file_dict


#未封装的代码：

# app = FastAPI()
# mysql_handler = mysql_handler(mysql_name, mysql_password, mysql_host, mysql_port, mysql_db)

# @app.post("/get_path")
# async def get_path(request : Request):
#         json_raw = await request.json()
#         path = json.loads(json.dumps(json_raw)).get("path")
#         file_dict = get_files(path)
#         file_names = list(file_dict.keys())
#         types = list(file_dict.values())
#         return {"file_names": file_names, "types": types}
# @app.post("/get_data")
# async def get_data(request : Request):
#         json_raw = await request.json()
#         search_df = mysql_handler.mysql_instance.search_data('files_data')
#         return json.loads(search_df.to_json(orient='records',force_ascii=False))

# @app.post("/update_data")
# async def update_data(request : Request):
#         json_raw = await request.json()
#         data = json.loads(json.dumps(json_raw)).get("data")
#         judgement = mysql_handler.update_data('files_data',data)
#         if judgement:
#             return {"status": "success"}
#         else:
#             return {"status": "fail"}
        
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
            search_df = self.mysql_instance.search_data('files_data')
            return json.loads(search_df.to_json(orient='records',force_ascii=False))

        @self.app.post("/update_data")
        async def update_data(request: Request):
            json_raw = await request.json()
            data = json.loads(json.dumps(json_raw)).get("data")
            judgement = self.mysql_instance.update_data('files_data',data)
            if judgement:
                return {"status": "success"}
            else:
                return {"status": "fail"}

    
if __name__ == '__main__':
    # 未封装运行
    # uvicorn.run(app, host = "127.0.0.1", port = 8000)
    # 封装运行
    mysql_instance = mysql_handler(mysql_name, mysql_password, mysql_host, mysql_port, mysql_db)
    api_instance = api(mysql_instance)
    uvicorn.run(api_instance.app, host = "127.0.0.1", port = 8000)




