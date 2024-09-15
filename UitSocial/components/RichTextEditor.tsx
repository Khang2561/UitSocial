import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { theme } from "@/constants/theme";
import { useEffect } from "react";
// Define the types for the props
interface RichTextEditorProps {
  editorRef: React.RefObject<RichEditor>;
  onChange: (text: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ editorRef, onChange }) => {
  
  useEffect(() => {
    console.log('Editor ref:', editorRef.current);
  }, [editorRef]);

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
          [actions.heading1]: ({ tintColor }: { tintColor: string }) => (
            <Text style={{ color: tintColor }}>H1</Text>
          ),
          [actions.heading4]: ({ tintColor }: { tintColor: string }) => (
            <Text style={{ color: tintColor }}>H4</Text>
          ),
        }}
        style={styles.richBar}
        flatContainerStyle={styles.flatStyle}
        selectedIconTint={theme.colors.primaryDark}
        editor={editorRef.current ?? undefined} // Use undefined if editorRef.current is null
        disabled={false}
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
  }
});

export default RichTextEditor;
