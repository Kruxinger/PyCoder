import eel
from random import randint
from pathlib import Path
import os
import json
import sys
import re
import threading

codes = None
eel.init(".")  
codes = None
search_strings = []
keywords = [
"and","as","assert","init","break","class","continue","def","del","elif","else","except","self","false","finally","for","from","global","if","import","in","is","lambda","None","nonlocal","not","or","pass","raise","return","frue","try","while","with","yield",]


def create_search_string(code):
    temp = re.findall("[a-zA-Z][a-zA-Z]+",code['title'])
    temp += re.findall("[a-zA-Z][a-zA-Z]+",code['content'])
    global keywords
    temp = list(set([el.lower() for el in temp if el.lower() not in keywords]))
    return {'id': code['id'], 'string':' '.join(temp)}

@eel.expose
def get_all_codes():
    global codes
    global search_strings
    codes = json.load(open("codes.json", "r", encoding="utf-8"))
    for code in codes:
        search_strings.append(create_search_string(code))
    return sort_codes_by_title(codes)

@eel.expose
def search(pattern):
    global codes
    global search_strings
    if pattern == "":
        return codes

    pattern = pattern.lower().strip()
    if " " in pattern:
        pattern = pattern.split()
    else:
        pattern = [pattern]

    ids = []
    for el in search_strings:
        meets_pattern = True
        for pat in pattern:
            if pat not in el['string']:
                meets_pattern = False
                break
        if meets_pattern:
            ids.append(el['id'])
    return sort_codes_by_title([el for el in codes if el['id'] in ids])
                
def sort_codes_by_title(codes):
    return sorted(codes, key=lambda i: i['title'].lower())

@eel.expose
def get_code(id):
    global codes
    id = int(id)
    for el in codes:
        if el['id'] == id:
            return el
    return None

@eel.expose
def delete_code(id):
    global search_strings
    global codes
    
    search_strings = [el for el in search_strings if el['id'] != id]
    codes = [el for el in codes if el['id'] != id]
    save_codes()

@eel.expose
def modify_code(id, title, content):
    global codes
    global search_strings
    if id == -1:
        id = max([el['id'] for el in codes])+1
        code = {
            'id' : id,
            'title': title,
            'content':content
        }
        codes.append(code)
        search_strings.append(create_search_string(code))
        save_codes()
    else:
        code = next(el for el in codes if el['id'] == id)
        code['title'] = title
        code['content'] = content
        for el in search_strings:
            if el['id'] == code['id']:
                el['string'] = create_search_string(code)['string']
        save_codes()
    return code

def save_codes():
    def save():
        global codes
        with open("codes.json", "w+", encoding='utf-8') as f:
            json.dump(codes,f,ensure_ascii=False)
            
    threading.Thread(target=save).start()
  
# Start the index.html file
eel.start("index.html")

