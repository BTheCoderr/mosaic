import axios from 'axios'
import { Platform } from 'react-native'

const CLOUDINARY_URL = process.env.CLOUDINARY_URL || 'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME'
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'YOUR_UPLOAD_PRESET'

interface UploadResponse {
  secure_url: string
  public_id: string
}

class CloudinaryService {
  async uploadImage(imageUri: string): Promise<UploadResponse> {
    try {
      // Create form data
      const formData = new FormData()
      
      // Add file
      formData.append('file', {
        uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      })
      
      // Add upload preset
      formData.append('upload_preset', UPLOAD_PRESET)

      // Make request to Cloudinary
      const response = await axios.post(`${CLOUDINARY_URL}/image/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return {
        secure_url: response.data.secure_url,
        public_id: response.data.public_id,
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error)
      throw new Error('Failed to upload image')
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await axios.post(`${CLOUDINARY_URL}/image/destroy`, {
        public_id: publicId,
      })
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error)
      throw new Error('Failed to delete image')
    }
  }
}

export const cloudinaryService = new CloudinaryService() 