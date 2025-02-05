import { NavigatorScreenParams } from '@react-navigation/native'

export type MainTabParamList = {
  Home: undefined
  Chat: undefined
  Matches: undefined
  Profile: undefined
}

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
}

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>
  Main: NavigatorScreenParams<MainTabParamList>
  Settings: undefined
  EditProfile: undefined
  ChatRoom: { chatId: string; userName: string }
} 