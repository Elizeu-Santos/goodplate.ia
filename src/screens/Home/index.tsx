import { useState } from 'react';
import { Alert, Image, ScrollView, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { styles } from './styles';

import { api } from '../../components/services/api';

import { Tip } from '../../components/Tip';
import { Item } from '../../components/Item';
import { Button } from '../../components/Button';

export function Home() {
  const [selectedImageUri, setSelectedImageUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSelectImage() {
    try {

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        return Alert.alert('Permissão necessária', 'Permitir que o app acesse sua biblioteca de fotos?');
      }

      setIsLoading(true);

      const response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });

      if (response.canceled) {
        return setIsLoading(false);
      }

      if (!response.canceled) {
        const imgManipulated = await ImageManipulator.manipulateAsync(
          response.assets[0].uri,
          [{ resize: { width: 900 } }],
          {
            compress: 1,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
          }
        );

        setSelectedImageUri(imgManipulated.uri);
        foodDetect(imgManipulated.base64);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function foodDetect(imageBase64: string | undefined) {
    const response = await api.post(`/v2/models/${process.env.EXPO_PUBLIC_API_MODEL_ID}/versions/${process.env.EXPO_PUBLIC_API_MODEL_VERSION_ID}/outputs`, {
      "user_app_id": {
        "user_id": process.env.EXPO_PUBLIC_API_USER_ID,
        "app_id": process.env.EXPO_PUBLIC_API_APP_ID
      }
    })
  }

  return (
    <View style={styles.container}>
      <Button onPress={handleSelectImage} disabled={isLoading} />

      {
        selectedImageUri ?
          <Image
            source={{ uri: selectedImageUri }}
            style={styles.image}
            resizeMode="cover"
          />
          :
          <Text style={styles.description}>
            Selecione a foto do seu prato para analizar.
          </Text>
      }

      <View style={styles.bottom}>
        <Tip message="Aqui vai uma dica" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 24 }}>
          <View style={styles.items}>
            <Item data={{ name: 'Vegetal', percentage: '95%' }} />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}