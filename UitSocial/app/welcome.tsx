import ScreenWrapper from "@/components/ScreenWrapprer";
import { View, Text, StatusBar, StyleSheet, Image, Pressable } from "react-native";
import { wp, hp } from '../helpers/common';
import { theme } from "../constants/theme";
import { Button } from "@/components/Button";
import { useRouter } from 'expo-router';


const Welcome = () => {
    const router = useRouter();
    return (
        <ScreenWrapper>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* Welcome Image */}
                <Image
                    style={styles.welcomeImage}
                    source={require('../assets/images/UitWelcome.png')}
                />
                <Text style={styles.title}>Uit Social</Text>
                <Text style={styles.punchline}>
                    Mạng xã hội dành cho sinh viên UIT
                </Text>
                {/* Footer */}
                <View style={styles.footer}>
                    <Button
                        title="Getting Started"
                        buttonStyle={{ marginHorizontal: wp(3) }}
                        onPress={() => router.push('/signUp')}
                    />
                    <View style={styles.bottomTextContainer}>
                        <Text style={styles.loginText}>
                            Bạn đã có tài khoản
                        </Text>
                        <Pressable onPress={()=>router.push('/login')}>
                            <Text
                                style={[
                                    styles.loginText,
                                    {
                                        color: theme.colors.primary,
                                        fontWeight: '600', // Change "semibold" to "600"
                                        marginLeft:20
                                    },
                                ]}
                            >
                                Đăng kí
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </ScreenWrapper>
    );
}

// Define styles for the component
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: wp(10),
    },
    welcomeImage: {
        width: wp(100),
        height: wp(100) * (4 / 4),
        resizeMode: 'contain',
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    punchline: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    footer: {
        width: '100%',
        marginTop: 10,
    },
    bottomTextContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    },
    loginText: {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: hp(1.6),
    },
});

export default Welcome; // Export the component
