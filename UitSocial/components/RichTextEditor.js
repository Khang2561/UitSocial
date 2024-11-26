import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";
import { theme } from "@/constants/theme";

// Define the types for the props

const RichTextEditor = ({ editorRef, onChange }) => {
  return (
    <View style={{ minHeight: 285 }}>
      <RichToolbar
        actions={[
          actions.setStrikethrough,
          actions.removeFormat,
          actions.setBold,
          actions.setItalic,
          actions.insertOrderedList,
          actions.blockquote,
          actions.alignLeft,
          actions.alignCenter,
          actions.alignRight,
          actions.code,
          actions.line,
          actions.heading1,
          actions.heading2,
        ]}
        iconMap={{
          [actions.heading1]: ({ tintColor }) => (
            <Text style={{ color: tintColor }}>H1</Text>
          ),
        }}
        style={styles.richBar}
        flatContainerStyle={styles.flatStyle}
        selectedIconTint={theme.colors.primaryDark}
        getEditor={() => editorRef.current}
      />
      <RichEditor
        ref={editorRef}
        containerStyle={styles.rich}
        editorStyle={styles.containerStyle}
        placeholder="Bạn đang cảm thấy như thế nào"
        onChange={onChange}
      />
    </View>
  );
};

//-----------------------------------------------------CSS----------------------------------------------------------------------
const styles = StyleSheet.create({
  richBar: {
    borderTopRightRadius: theme.radius.xl,
    borderTopLeftRadius: theme.radius.xl,
    backgroundColor: theme.colors.gray,
  },
  rich: {
    minHeight: 240,
    flex: 1,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
    borderColor: theme.colors.gray,
    padding: 5,
  },
  containerStyle: {
    color: theme.colors.textDark,
  },
  flatStyle: {
    paddingHorizontal: 8,
    gap: 3,
  },
});

export default RichTextEditor;
