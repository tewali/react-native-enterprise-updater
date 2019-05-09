import {Dimensions} from "react-native";

const window = Dimensions.get('window');

export default {
    title: {
        fontSize: 20,
        marginBottom: 20
    },
    close: {
      position: 'absolute',
        top: 0,
        right: 10,

    },
    body: {
        alignItems: 'center'
    },
    closeButton: {
        fontSize: 25,
        padding: 10
    },
    version: {
      color: '#787778',
        fontSize: 12
    },
    modal: {
        justifyContent:'center',
        alignItems: 'center',
        flex: 1
    },
    button: {
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 15,
        paddingBottom: 15,
        backgroundColor: '#47525e',
        marginTop: 30,
        alignSelf: 'stretch',
        alignItems: 'center',

    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 17
    },
    logoStyle: {
        alignSelf: 'center',
        width: window.width * 0.5,
        height: window.width * 0.5
    },
    imageContainer: {
        marginBottom: 30

    },
    innerContainer: {
        justifyContent: 'center',
        paddingLeft: 30,
        paddingRight: 30,
        flex: 1
    },
        description: {
        marginTop: 20,
            marginBottom: 30,
            fontSize: 15,
            lineHeight: 22
    }
};
