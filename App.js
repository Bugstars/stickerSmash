import {useState, useRef} from 'react';
import {StyleSheet, View, Platform} from 'react-native';
import {captureRef} from 'react-native-view-shot';
import {StatusBar} from "expo-status-bar";
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

import domtoimage from 'dom-to-image';

import Button from './components/Button';
import ImageViewer from './components/ImageViewer';
import CircleButton from './components/CircleButton';
import IconButton from './components/IconButton';
import EmojiPicker from './components/EmojiPicker';
import EmojiList from "./components/EmojiList";
import EmojiSticker from './components/EmojiSticker';

import {GestureHandlerRootView} from "react-native-gesture-handler";

const PlaceholderImage = require("./assets/images/background-image.png");

export default function App() {

    const [status, requestPermission] = MediaLibrary.usePermissions();

    const [showAppOptions, setShowAppOptions] = useState(false);

    const [isModalVisible, setIsModalVisible] = useState(false);

    const [selectedImage, setSelectedImage] = useState(null);

    const [pickedEmoji, setPickedEmoji] = useState(null);

    const imageRef = useRef();

    if (status === null) {
        requestPermission();
    }

    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setShowAppOptions(true);
        } else {
            alert('你没有选择任何图片');
        }
    };

    const onReset = () => {
        setShowAppOptions(false);
    };

    const onAddSticker = () => {
        setIsModalVisible(true);
    };

    const onSaveImageAsync = async () => {
        if (Platform.OS !== 'web') {
            try {
                const localUri = await captureRef(imageRef, {
                    height: 440,
                    quality: 1,
                });
                await MediaLibrary.saveToLibraryAsync(localUri);
                if (localUri) {
                    alert('已保存！');
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            try {
                const dataUrl = await domtoimage.toJpeg(imageRef.current, {
                    quality: 0.95,
                    width: 320,
                    height: 440,
                });

                let link = document.createElement('a');
                link.download = 'sticker-smash.jpeg';
                link.href = dataUrl;
                link.click();
            } catch (e) {
                console.log(e);
            }
        }
    };

    const onModalClose = () => {
        setIsModalVisible(false);
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.imageContainer}>
                <View ref={imageRef} collapsable={false}>
                    <ImageViewer placeholderImageSource={PlaceholderImage} selectedImage={selectedImage}/>
                    {pickedEmoji && <EmojiSticker imageSize={40} stickerSource={pickedEmoji}/>}
                </View>
            </View>
            {showAppOptions ? (
                <View style={styles.optionsContainer}>
                    <View style={styles.optionsRow}>
                        <IconButton icon="refresh" label="重置" onPress={onReset}/>
                        <CircleButton onPress={onAddSticker}/>
                        <IconButton icon="save-alt" label="保存" onPress={onSaveImageAsync}/>
                    </View>
                </View>
            ) : (
                <View style={styles.footerContainer}>
                    <Button theme="primary" onPress={pickImageAsync} label="选择一张照片"/>
                    <Button label="选用这张照片" onPress={() => setShowAppOptions(true)}/>
                </View>
            )}
            <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
                <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose}/>
            </EmojiPicker>
            <StatusBar style="light"/>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        alignItems: 'center',
    },
    imageContainer: {
        flex: 1,
        paddingTop: 58,
    },
    footerContainer: {
        flex: 1 / 3,
        alignItems: 'center',
    },
    optionsContainer: {
        position: 'absolute',
        bottom: 80,
    },
    optionsRow: {
        alignItems: 'center',
        flexDirection: 'row',
    },
});
