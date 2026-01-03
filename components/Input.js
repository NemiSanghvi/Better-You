import { useState } from 'react';
import { TextInput } from 'react-native';
import styles from '../styles/StyleSheet';

const Input = ({ value, onChangeText, placeholder, onSubmitEditing, autoFocus, multiline, style }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      style={[
        multiline ? styles.multilineInput : styles.input,
        isFocused && { borderColor: '#FFD23F' },
        style
      ]}
      placeholder={placeholder}
      placeholderTextColor="#FFB84D"
      value={value}
      onChangeText={onChangeText}
      autoFocus={autoFocus}
      onSubmitEditing={onSubmitEditing}
      multiline={multiline}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
};

export default Input;

