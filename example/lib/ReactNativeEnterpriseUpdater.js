import React, {Component} from 'react';
import {
    View,
    Text,
    Modal,
    Linking,
    TouchableOpacity,
    Image,
    AppState,
    ActivityIndicator,
    SafeAreaView,
    NativeModules,
    Platform
} from 'react-native';
import PropTypes from 'prop-types';
import styles from './styles';
import localizationStrings from './localization';
const NativeUpdater = NativeModules.NativeUpdater;

class UpdateChecker extends Component {
    state = {
        updateAvailable: false,
        step: 0,
        visible: true
    };
    newVersion: null;
    currentVersion: null;
    appState = 'active';

    constructor(props) {
        super(props);
        this.handleAppStateChange = this.handleAppStateChange.bind(this);
    }

    componentDidMount() {
        AppState.addEventListener('change', this.handleAppStateChange);
        this.checkUpdateAvailable();
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.handleAppStateChange);
    }

    handleAppStateChange(nextAppState) {
        // Here we just came back from installing the app, so we can show the 'complete' screen
        if (this.state.step === 1 && this.appState === 'inactive' && nextAppState === 'active') {
            this.setState({ ...this.state, step: 2 });
        }
        // Here we do an update check intermediately in case we just activated the app again
        else if (this.state.step === 0 && (this.appState === 'inactive' || this.appState === 'background') && nextAppState === 'active') {
            this.checkUpdateAvailable();
        }

        this.appState = nextAppState;
    }

    checkUpdateAvailable() {
        this.getCurrentVersion().then(() => {
            this.checkVersion().then((isAvailable) => {
                this.setState({ ...this.state, updateAvailable: isAvailable, visible: isAvailable })
            });
        });
    }

    async getCurrentVersion() {
        if (this.props.currentVersion) {
            this.currentVersion = this.props.currentVersion;
        }
        else if (NativeUpdater) {
            this.currentVersion = await NativeUpdater.getVersion();
        } else {
            throw new Error('The current version of the app could not be verified.')
        }
    }

    async checkVersion() {
        const {url} = this.props;
        let response = await fetch(
          url + '/manifest.plist',
        );
        let responseJson = await response.text();
        let index = responseJson.indexOf('bundle-version');
        responseJson = responseJson.substr(index);
        index = responseJson.indexOf('<string>');
        responseJson = responseJson.substr(index + 8);
        index = responseJson.indexOf('<');
        responseJson = responseJson.substr(0, index);
        this.newVersion = responseJson;
        return this.newVersion > this.currentVersion;
    }

    triggerUpdate() {
        this.setState({ ...this.state, step: 1 });
        const {url} = this.props;
        Linking.openURL('itms-services://?action=download-manifest&url=' + url + '/manifest.plist');
    }

    render() {
        if (Platform.OS === 'android') {
            return null;
        }
        const {updateAvailable, step, visible} = this.state;
        const {logo, forceUpdate, locale='en'} = this.props;
        const localization = localizationStrings[locale];
        return !updateAvailable ?
            null :
            <Modal visible={visible}>
                <SafeAreaView style={styles.modal}>
                    {step === 0 && <View style={styles.innerContainer}>
                        <View style={styles.body}>

                            <View style={styles.imageContainer}>
                                <Image source={logo ? logo : require('./assets/Update.png')} style={styles.logoStyle} resizeMode='contain'/>
                            </View>

                      <Text style={styles.title}>{forceUpdate ? 'Mandatory ' : ''}{localization.updateAvailable}</Text>
                        <Text style={styles.version}>Version {this.newVersion}</Text>
                        <Text style={styles.description}>
                            {localization.updateDescription}
                        </Text>
                        </View>

                        <TouchableOpacity onPress={this.triggerUpdate.bind(this)}>
                            <View style={styles.button}><Text style={styles.buttonText}>{localization.updateNow}</Text></View>
                        </TouchableOpacity>

                    </View> }
                    {step === 1 && <View style={styles.innerContainer}>
                        <View style={styles.body}>
                            <View style={styles.imageContainer}>
                                <Image source={require('./assets/InProgress.png')} style={styles.logoStyle} resizeMode='contain'/>
                            </View>
                            { /* <View style={styles.title}><ActivityIndicator size='large'/></View> */ }
                        <Text style={styles.title}>{localization.preparing}</Text>
                        <Text style={styles.description}>
                            {localization.preparationDescription}
                        </Text>
                        </View>
                        </View> }
                    {step === 2 && <View style={styles.innerContainer}>
                        <View style={styles.imageContainer}>
                            <Image source={require('./assets/Complete.png')} style={styles.logoStyle} resizeMode='contain'/>
                        </View>
                        <View style={styles.body}>
                        <Text style={styles.title}>{localization.updateConfirmation}</Text>
                        <Text style={styles.description}>
                            {localization.updateCompleteDescription}
                        </Text>
                        </View>
                            {NativeUpdater &&
                        <TouchableOpacity onPress={() => NativeUpdater.closeApp()}>
                            <View style={styles.button}><Text style={styles.buttonText}>
                                {localization.closeNow}
                            </Text></View>
                        </TouchableOpacity>}
                    </View> }
                    {!forceUpdate && <SafeAreaView style={styles.close}>
                            <TouchableOpacity onPress={() => this.setState({ ...this.state, visible: false })}>
                            <Text style={styles.closeButton}>x</Text>
                            </TouchableOpacity>
                            </SafeAreaView> }

                </SafeAreaView>
            </Modal>
    }
}

const isNewVersionAvailable = (currentVersion) => {};

UpdateChecker.propTypes = {
  url: PropTypes.string,
  forceUpdate: PropTypes.bool,
  logo: PropTypes.any,
  currentVersion: PropTypes.number,
  locale: PropTypes.string
};

export {UpdateChecker, isNewVersionAvailable}

