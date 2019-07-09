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
        updateAvailable: 0,
        step: 0,
        visible: true
    };
    newVersion: null;
    currentVersion: null;
    appState = 'active';

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

    constructor(props) {
        super(props);
        this._handleAppStateChange = this._handleAppStateChange.bind(this);
    }

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
        this.getCurrentVersion().then(() => {
            this.checkVersion().then((response) => {
                this.setState({...this.state, updateAvailable:response})
            });
        });
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange(nextAppState) {
        if (this.state.step === 1 && (this.appState === 'inactive' || this.appState === 'background') && nextAppState === 'active') {
            this.dialogShown();
        }
        this.appState = nextAppState;
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

    triggerUpdate() {
        this.setState({...this.state, step: 1});
        const {url} = this.props;
        Linking.openURL('itms-services://?action=download-manifest&url=' + url + '/manifest.plist');
    }

    dialogShown() {
        this.setState({...this.state, step: 2});
    }

    hideModal() {
        this.setState({...this.state, visible: false});
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
                            <TouchableOpacity onPress={this.hideModal.bind(this)}>
                            <Text style={styles.closeButton}>x</Text>
                            </TouchableOpacity>
                            </SafeAreaView> }

                </SafeAreaView>
            </Modal>
    }
}

const isNewVersionAvailable = (currentVersion) => {

};

UpdateChecker.propTypes = {
  url: PropTypes.string,
  forceUpdate: PropTypes.bool,
  logo: PropTypes.any,
  currentVersion: PropTypes.number,
  locale: PropTypes.string
};

export {UpdateChecker, isNewVersionAvailable}
