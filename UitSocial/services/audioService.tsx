import React, { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import { StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import { Slider } from 'react-native-elements';

const AudioPlayer = ({ uri }: { uri: string }) => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackPosition, setPlaybackPosition] = useState(0);
    const [playbackDuration, setPlaybackDuration] = useState(0);

    useEffect(() => {
        const loadAudio = async () => {
            try {
                const { sound: audio, status } = await Audio.Sound.createAsync(
                    { uri },
                    { shouldPlay: false }
                );
                setSound(audio);
                if (status.isLoaded) {
                    setPlaybackDuration(status.durationMillis || 0);
                }
            } catch (error) {
                console.error('Error loading audio', error);
            }
        };

        loadAudio();

        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [uri]);

    const playAudio = async () => {
        if (sound) {
            try {
                await sound.playAsync();
                setIsPlaying(true);
            } catch (error) {
                console.error('Error playing audio', error);
            }
        }
    };

    const pauseAudio = async () => {
        if (sound) {
            try {
                await sound.pauseAsync();
                setIsPlaying(false);
            } catch (error) {
                console.error('Error pausing audio', error);
            }
        }
    };

    const handleSeek = async (value: number) => {
        if (sound) {
            try {
                await sound.setPositionAsync(value);
                setPlaybackPosition(value);
            } catch (error) {
                console.error('Error seeking audio', error);
            }
        }
    };

    const updatePlaybackPosition = async () => {
        if (sound) {
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
                setPlaybackPosition(status.positionMillis);
            }
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            updatePlaybackPosition();
        }, 1000);

        return () => clearInterval(interval);
    }, [sound]);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={isPlaying ? pauseAudio : playAudio}
                style={[styles.controlButton, isPlaying ? styles.pauseButton : styles.playButton]}
            >
                <Text style={styles.buttonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
            </TouchableOpacity>

            <Slider
                style={styles.slider}
                value={playbackPosition}
                minimumValue={0}
                maximumValue={playbackDuration}
                onSlidingComplete={handleSeek}
                thumbTintColor="#008CBA"
            />

            <View style={styles.timeContainer}>
                <Text style={styles.timeText}>
                    {Math.floor(playbackPosition / 1000)} / {Math.floor(playbackDuration / 1000)} sec
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        margin: 10,
    },
    controlButton: {
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    playButton: {
        backgroundColor: '#008CBA',
    },
    pauseButton: {
        backgroundColor: '#e74c3c',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    slider: {
        width: '100%',
        marginBottom: 10,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 5,
    },
    timeText: {
        color: 'gray',
        fontSize: 14,
    },
});

export default AudioPlayer;
