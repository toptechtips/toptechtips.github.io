---
layout: post
title: How to return datetime, dicts, lists, xml, pydantic models and other data types response in fastAPI (With Examples)
comments: true
subtitle: In this guide we learn how to return different types of data and how we can create our own custom response 
show-avatar: false
toc: true
tags: [fastapi, pydantic, datetime, python, rest]
---


FastAPI has made it **easy** for you to **handle responses** that **deal with all sorts of data types** (like datetime objects). However, It's important to understand how FastAPI handles responses as you may run into bugs and lengthy debugging sessions otherwise. More info on [FastAPI docs](https://fastapi.tiangolo.com/tutorial/extra-data-types/)

<br/>

## Understanding how FastAPI return responses

By **default** FastAPI will **automatically convert any return value into JSON** using the ```jsonable_encoder()``` function. Then behind the scenes, that JSON data is returned using ```JSONReponse()``` back to the client.

The process goes:
1. **Initiate return** response from your FastAPI path / route
2. **Convert return data** into **JSON-compatible data** (e.g. a python dict) 
3. FastAPI uses ```JSONReponse(content=JSON-compatible data)``` behind the scenes
4. JSON response **back to client**

You can however skip all this and create your own custom response using JSONResponse, Response (or any other subclass of Response) - But more on this after these examples.

<br/>


### Using FastAPI's automatic return response handling


#### Return a dict object as response
```python
@app.get("/item")
async def get_item():
    return {"item": "toy"}
```

**Outputs**:

return dict as is
```json
{"item":"toy"}
```

<br/>

#### Return a list as response
```python
@app.get("/item")
async def get_item():
    return [{"item": "toy"}]
```

**Outputs**:

return list as is
```json
[{"item":"toy"}]
```

<br/>

#### Return a string as response
```python
@app.get("/item")
async def get_item():
    return "toy"
```

**Outputs**:

returns string as is
```json
"toy"
```
<br/>


#### Return a datetime object as response
From the [docs](https://fastapi.tiangolo.com/tutorial/extra-data-types/) - datetime objects will be returned in this string format:

>datetime.datetime:
    A Python datetime.datetime.
    In requests and responses will be represented as a str in ISO 8601 format, like: 2008-09-15T15:53:00+05:00.
```python
@app.get("/item")
async def get_item():
    return datetime.now()
```

**Outputs**:

outputs today's date. datetime object is automatically converted into string format
```json
"2023-06-05T14:29:58.969626"
```

<br/>

#### Return Pydantic Model for response
```python
class ItemOne(BaseModel):
    item_name: str
    item_create_date: datetime

@app.get("/item")
async def get_item():
    item = ItemOne(item_name="toy car", item_create_date=datetime.now())
    return item
```

**Outputs**:

returns json dict of Pydantic Model, the datetime object for the ```item_create_date``` field is automatically converted into a string format
```json
{"item_name":"toy car","item_create_date":"2023-06-05T14:31:33.718624"}
```

<br/>


### Return a response manually using the Response Class e.g. for headers, xml and other types of responses
Sometimes you may want to **return your own custom response directly without** FastAPI **interfering** with your data. For example, you might want to return XML data.
```python
from fastapi.responses import Response

@app.get("/item")
async def get_item():
    data = """<?xml version="1.0"?>
    <person>
    <Header>
        Header Data.
    </Header>
    <Body>
        Body Data
    </Body>
    </person>
    """
    return Response(content=data, media_type="application/xml")
```

**Outputs**:

returns xml data
```xml
<person>
<Header> Header Data. </Header>
<Body> Body Data </Body>
</person>
```

<br/>

### Return a response manually using JSONResponse Class
You want to return a JSON response, but you want to supply your own JSON-compatible object (e.g. python dict) as don't want FastAPI interferring with your data
```python
@app.get("/item")
async def get_item():
    return JSONResponse(status_code=200, content={"msg": "some message"})
```

**Outputs**:

```json
{"msg":"some message"}
```

BONUS: this is quite useful since it allows you to add other important information to your responses like ```status_code```. This is quite handy especially when handling errors as we will see in the example below

<br/>

## Example 1 - Using a Pydantic Model and datetime object with custom JSON response for error handling

In this example, we have the ```GET /item``` path which will return an JSON object that has a string field and a datetime field. We also want to have error handling incase some error arises

```python
from pydantic import BaseModel
from datetime import datetime
from fastapi import FastAPI
from fastapi.responses import JSONResponse


class ItemOne(BaseModel):
    item_name: str
    item_create_date: datetime


app = FastAPI()


@app.get("/item")
async def get_item():
    try:
        item = ItemOne(item_name="toy", item_create_date=datetime.now())
    except Exception as e:
        JSONResponse(status_code=500, content={"error": str(e)})
    return item
```

**Outputs (success)**:

```json
{"item_name":"toy","item_create_date":"2023-06-05T15:00:42.456734"}
```

**Outputs (error)**:

I modified the function a little bit just to trigger the error.

```
Internal Server Error
```

When we inspect the response, we see that the status code is 500

Also on the terminal where we are running our FastAPI instance, uvicorn outputs this:
```bash
INFO:     172.20.0.1:40578 - "GET /item HTTP/1.1" 500 Internal Server Error
```

<br/>

## Example 2 - Return a formatted time from FastAPI

Here we use a **validator** in order to **return our datetime object in a different string format**. Do note that the ```custom_datetime_format``` is not "safe" and will throw an error if the input value is not a datetime object.

```python
from pydantic import BaseModel, validator
from datetime import datetime
from fastapi import FastAPI
from fastapi.responses import JSONResponse


class ItemOne(BaseModel):
    item_name: str
    item_create_date: datetime

    @validator('item_create_date')
    def custom_datetime_format(cls, v):
        return datetime.strftime(v, "%m/%d/%Y, %H:%M:%S")
    

app = FastAPI()


@app.get("/item")
async def get_item():
    try:
        item = ItemOne(item_name="toy", item_create_date=datetime.now())
    except Exception as e:
        JSONResponse(status_code=500, content={"error": str(e)})
    return item

```

**Outputs**:

```json
{"item_name":"toy","item_create_date":"06/05/2023, 18:45:52"}
```


There are some other methods that you can use, but personally for my use case the use of ```validator``` was enough.
- [Other Solution 1](https://stackoverflow.com/questions/66548586/how-to-change-date-format-in-pydantic)
- [Other Solution 2](https://github.com/tiangolo/fastapi/issues/5036)


You can also just manually modify your return so that if it's a dict with a datetime field, just manually modify that - [Example](https://lightrun.com/answers/tiangolo-fastapi-how-to-maintain-the-datetime-format-same-as-input).

<br/>

## Conclusion

To summarize:
- There's generally 2 ways to go about when generating responses in FastAPI
- You model your responses with pydantic which allows you to customize your responses and validate them easily
- You don't use pydantic to model your response and instead do your own thing. You also use Response (or any other subclass of this) to generate your own response


**Other resources**
- [stackoverflow answer](https://stackoverflow.com/questions/73972660/how-to-return-data-in-json-format-using-fastapi)