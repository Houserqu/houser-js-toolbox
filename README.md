# houser-js-toolbox
My javascript toolbox, you can say it is a collection of wheel.

## Progress

#### :heavy_check_mark: queryJson

json to url param string

将json对象转换urlencode格式

#### :heavy_check_mark: array.del

delete object array item

删除对象数组的指定项

#### :heavy_check_mark: tree.build

build tree by record

根据行记录构建对象树

#### :heavy_multiplication_x: deepCopy

json deep copy

## Development

### 目录说明

src：es6编写的源代码
lib: src目录下通过babel转换生成的es5代码
build：webpack打包生成的单个js文件
test：测试用例

### compile

将src目录下的es6源文件转换成es5，放到lib目录中

```bash
npm run compile
```

### build

将src目录下的es6源文件转换成es5，打包成单个js文件，便于在html种直接使用

```bash
npm run build
```