from fastapi import FastAPI, Request
import uvicorn, json, os, glob
from sqlalchemy import create_engine
import pandas as pd
from config import mysql_host, mysql_port, mysql_db, mysql_name, mysql_password


class mysql_handler:
    def __init__(self, mysql_name, mysql_password, mysql_host, mysql_port, mysql_db):
        self.mysql_name = mysql_name
        self.mysql_password = mysql_password
        self.mysql_host = mysql_host
        self.mysql_port = mysql_port
        self.mysql_db = mysql_db
        self.url = f'mysql+pymysql://
                               {self.mysql_name}:{self.mysql_password}@
                               {self.mysql_host}:{self.mysql_port}/{self.mysql_db}'
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


class api:
    def __init__(self, host, port, mysql_instance):
        self.host = host
        self.port = port
        self.app = FastAPI()
        self.mysql_instance = mysql_instance

    async def get_path(self, request : Request):
        json_raw = await request.json()
        path = json.loads(json.dump(json_raw)).get("path")
        file_dict = get_files(path)
        file_names = list(file_dict.keys())
        types = list(file_dict.values())
        return {"file_names": file_names, "types": types}

    
    async def get_data(self, request : Request):
        json_raw = await request.json()
        search_df = self.mysql_instance.search_data('files_data')
        return json.loads(search_df.to_json(orient='records',force_ascii=False))

    
    async def update_data(self, request : Request):
        json_raw = await request.json()
        judgement = self.mysql_instance.update_data('files_data')
        if judgement:
            return {"status": "success"}
        else:
            return {"status": "fail"}
    
    def run(self):
        @self.app.post("/get_path")
        async def get_path_wrapper(request: Request):
            return await self.get_path(request)

        @self.app.post("/get_data")
        async def get_data_wrapper(request: Request):
            return await self.get_data(request)

        @self.app.post("/update_data")
        async def update_data_wrapper(request: Request):
            return await self.update_data(request)
        uvicorn.run(self.app, host=self.host, port=self.port)

if __name__ == '__main__':
    mysql_handler = mysql_handler(mysql_name, mysql_password, mysql_host, mysql_port, mysql_db)
    Myapi = api("127.0.0.1", 8000, mysql_handler)
    Myapi.run()
