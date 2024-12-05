import { View, Text, Switch, StyleSheet } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapprer';
import Header from '@/components/Header';
import React, { useState } from "react";

export default function ManagementInfo() {

    const [isAddressEnabled, setIsAddressEnabled] = useState(true);
    const [isPhoneEnabled, setIsPhoneEnabled] = useState(true);
    const [isDobEnabled, setIsDobEnabled] = useState(true);

    return (
        <ScreenWrapper>
            <Header title="Quản lý thông tin cá nhân" />
            <View style={styles.container}>
                {/* Địa chỉ */}
                <View style={styles.row}>
                    <Text style={styles.text}>Địa chỉ</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={isAddressEnabled ? "#f5dd4b" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => setIsAddressEnabled((prev) => !prev)}
                        value={isAddressEnabled}
                    />
                </View>
                {/* Số điện thoại */}
                <View style={styles.row}>
                    <Text style={styles.text}>Số điện thoại</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={isPhoneEnabled ? "#f5dd4b" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => setIsPhoneEnabled((prev) => !prev)}
                        value={isPhoneEnabled}
                    />
                </View>
                {/* Ngày tháng năm sinh */}
                <View style={styles.row}>
                    <Text style={styles.text}>Ngày tháng năm sinh</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={isDobEnabled ? "#f5dd4b" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => setIsDobEnabled((prev) => !prev)}
                        value={isDobEnabled}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 30,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    text: {
        fontSize: 16,
        color: "#333",
        flex: 1, // Nhãn chiếm tối đa không gian còn lại
    },
});
