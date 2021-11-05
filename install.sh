#!/bin/bash


echo "开始安装依赖包，请勿关闭终端..."

npm install

echo "基础包安装完成..."
if [ $? -ne 0 ]; then
  echo "基础包安装失败，请手动进行安装"

  exit 0

fi 

echo "正在安装前端模块，请稍后..."

cd web

npm install 

if [ $? -ne 0 ]; then
  echo "前端依赖包安装失败，请进去web目录手动进行安装"

  exit 1

fi 

echo "安装完成"
echo "请运行npm run dev，运行项目"




