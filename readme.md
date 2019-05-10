# React Native Enterprise Updater

A React Native module that allows you to easily update enterprise apps. 

## Getting Started
Install the NPM-package:
```
npm i --save react-native-enterprise-updater
```

Optional: Link the native dependencies. 
 ```
 react-native link react-native-enterprise-updater
 ```
 
 
## Usage

```javascript
import {UpdateChecker} from "react-native-enterprise-updater";

<UpdateChecker
    url={} // parent url of the manifest.xml-file
    currentVersion={} // not necessary if you are installing the native code
    forceUpdate={false} // controls if the user can skip an update
/>
```
