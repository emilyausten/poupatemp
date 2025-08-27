// Configuração do Capacitor
interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server?: {
    url?: string;
    cleartext?: boolean;
  };
  plugins?: Record<string, any>;
  android?: Record<string, any>;
}

const config: CapacitorConfig = {
  appId: 'com.poupatempo.app',
  appName: 'Poupa Tempo',
  webDir: 'dist',
  server: {
    url: "https://5de4a913-6123-4099-8886-bcc4c91e2cc4.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
      // Configurações adicionais para melhor funcionamento no Android
      channelId: "default",
      channelName: "Poupa Notificações",
      channelDescription: "Notificações importantes sobre seus agendamentos",
      channelImportance: 4, // IMPORTANCE_HIGH
      visibility: 1, // VISIBILITY_PUBLIC
      priority: 2, // PRIORITY_MAX
      vibrate: true,
      lights: true,
      lightColor: "#488AFF"
    },
    // Configurações para o Android
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  },
  // Configurações específicas para Android
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    // Configurações de permissões
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: "APK"
    }
  }
};

export default config;