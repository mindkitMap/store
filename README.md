# @mind-kit/store



MindKit 默认存储。



## 存储结构

默认的 respository 类型为 Vault，支持存储。其存储结构如下。

|       |                |           |                                                              |
| ----- | -------------- | --------- | ------------------------------------------------------------ |
| Valut | （path）       |           | string，路径，一般来说是本地路径。Valut默认存储在本地，借助icloude等文件夹同步机制跨端。 |
|       | info.json      |           | repository本身的信息。                                       |
|       |                | includes  | repository引用。                                             |
|       | （子目录）     |           | 每个子目录对应一个Topic。命名约定是 ``filenamify(`${topic.root.text.substr(0,20)}.${topic.id}.vault.textbundle`) `` https://github.com/sindresorhus/filenamify |
|       | （子目录内容） |           | 子目录的内容按照类似于`textbunlde`的约定组织。               |
|       |                | text.yaml | 节点的文本内容，对人类友好，可以通过直接修改此文件来编辑和组织节点。 |
|       |                | full.yaml | 节点的全部信息，对人类不友好。这些信息在load之后会被text.yaml的信息覆盖一次，以试手工编辑生效。(TODO) |
|       |                | info.json | Topic的信息。少量。                                          |
|       | （其他子目录） |           | 不符合Topic命名的子目录被认为是一个层级关系，将会递归读取，目前其层级关系还没有用。即./a/xxx子目录里面的topic和./b子目录里面的topic被认为没有区别。层级关系可能会被解释为某种分类。 |

