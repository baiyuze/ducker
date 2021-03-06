#!/bin/bash
#

echo $1
echo $2

i=0
currentArray=()
while read -r line; do
    sname=$(echo "$line" | awk -F  "(, )|(: )|[)]" '{print $2}')
    sdev=$(echo "$line" | awk -F  "(, )|(: )|[)]" '{print $4}')
    i=$(($i+1))
    echo "Current service: $sname, $sdev, $currentservice"
    if [ -n "$sdev" ]; then
        ifout="$(ifconfig "$sdev" 2>/dev/null)"
        echo "$ifout" | grep 'status: active' > /dev/null 2>&1
        rc="$?"
        if [ "$rc" -eq 0 ]; then
            currentArray[$i]=$sname
            currentservice="$sname"
            currentdevice="$sdev"
            currentmac=$(echo "$ifout" | awk '/ether/{print $2}')

            # may have multiple active devices, so echo it here
            echo "$currentservice"
        fi
    fi
done <<< "$(networksetup -listnetworkserviceorder | grep 'Hardware Port')"
echo ${currentArray[@]} $line 122212121


if [ -z "$currentservice" ]; then
    >&2 echo "Could not find current service"
    exit 1
fi

echo  Open web proxy  for  currentservice: $currentservice

if  [  "$2"  !=  ""  ];  then
    networksetup -setautoproxystate $currentservice off   #关闭Web HTTPS代理
    networksetup -setwebproxy $currentservice $1 $2    #设置Web HTTP代理
    networksetup -setsecurewebproxy $currentservice $1 $2    #设置Web HTTPS代理
fi
networksetup -setautoproxystate $currentservice off   #关闭Web HTTPS代理
networksetup -setwebproxystate $currentservice on    #打开Web HTTP代理
networksetup -setsecurewebproxystate $currentservice on   #打开Web HTTPS代理
echo  Done