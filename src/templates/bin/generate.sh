#!/bin/bash

rootPath=$(dirname $(pwd))
workspace=$GOPATH/src/pinfire.cn/golang/server
tsSource=$workspace/build/typescript
tsDirect=$rootPath/src/libs/typings/server

case "$1" in
types)
	echo "build typescript libs ..."
	cd $workspace
	rm -rf $tsSource $tsDirect
	git checkout master -f && git pull
	sudo chmod +x console.sh && ./console.sh types
	sudo cp -r $tsSource/pinfire.cn/golang/server $tsDirect

	echo "build typescript http service ..."
	cd $rootPath
	python $rootPath/bin/generate.py
	;;
esac
