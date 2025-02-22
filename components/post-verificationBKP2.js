import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  ProgressBarAndroid,
  ProgressBar,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

const API_BASE_URL = 'YOUR_API_URL'; // Replace with your API URL

const PropertyVerificationModal = ({ visible, onClose, propertyId }) => {
  const [files, setFiles] = useState({
    deed: null,
    id: null,
    self: null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const pickFile = async (type) => {
    try {
      if (type === 'self') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const { uri } = result.assets[0];
          setFiles((prev) => ({
            ...prev,
            [type]: {
              uri,
              name: 'self_photo.jpg',
              type: 'image/jpeg',
            },
          }));
        }
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['image/*', 'application/pdf'],
          copyToCacheDirectory: true,
        });

        if (result.type === 'success') {
          const fileType = result.name.endsWith('.pdf')
            ? 'application/pdf'
            : 'image/jpeg';

          setFiles((prev) => ({
            ...prev,
            [type]: {
              uri: result.uri,
              name: result.name,
              type: fileType,
            },
          }));
        }
      }
    } catch (error) {
      console.error('File picking error:', error);
      Alert.alert('Error', 'Could not select file');
    }
  };

  const removeFile = (type) => {
    setFiles((prev) => ({
      ...prev,
      [type]: null,
    }));
  };

  const handleSubmit = async () => {
    if (!files.deed || !files.id || !files.self || !fullName || !phone) {
      Alert.alert('Error', 'Please fill all fields and upload required documents');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('property_id', propertyId);
      formData.append('deed', files.deed);
      formData.append('id', files.id);
      formData.append('self', files.self);
      formData.append('full_name', fullName);
      formData.append('phone', phone);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      };

      await axios.post(`${API_BASE_URL}/property/verify`, formData, config);

      Alert.alert('Success', 'Documents uploaded successfully', [
        { text: 'OK', onPress: onClose },
      ]);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const renderFilePreview = (file, type) => {
    if (!file) return null;

    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: file.uri }} style={styles.previewImage} />
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFile(type)}
        >
          <MaterialIcons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify Property Ownership</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter Full Name"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter Phone Number"
              keyboardType="phone-pad"
            />
          </View>

          {['deed', 'id', 'self'].map((type) => (
            <View key={type} style={styles.section}>
              <Text style={styles.label}>
                {type === 'self' ? 'Self Photo' : `Property ${type}`}
              </Text>
              {renderFilePreview(files[type], type)}
              {!files[type] && (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => pickFile(type)}
                >
                  <MaterialIcons
                    name={type === 'self' ? 'camera-alt' : 'upload-file'}
                    size={24}
                    color="#666"
                  />
                  <Text style={styles.uploadText}>
                    {type === 'self' ? 'Take Photo' : 'Upload File'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {isUploading && (
            <ProgressBar
              styleAttr="Horizontal"
              indeterminate={false}
              progress={uploadProgress / 100}
              color="#2196F3"
              style={styles.progressBar}
            />
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!files.deed || !files.id || !files.self || !fullName || !phone || isUploading) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!files.deed || !files.id || !files.self || !fullName || !phone || isUploading}
        >
          <Text style={styles.submitText}>
            {isUploading ? `Uploading... ${uploadProgress}%` : 'Submit Documents'}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  uploadText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
  },
  previewContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#bdbdbd',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },  
  progressBar: {
    marginTop: 8,
  },
});

export default PropertyVerificationModal;