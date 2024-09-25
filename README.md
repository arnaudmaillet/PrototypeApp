# Installation de Mapbox dans un projet Expo

Ce guide vous explique comment installer et configurer Mapbox dans un projet Expo pour afficher des cartes interactives dans votre application.

## Prérequis

1. **Node.js**: Assurez-vous que Node.js est installé sur votre machine. Vous pouvez vérifier en exécutant la commande suivante dans le terminal :

   ```bash
   node -v
   ```

2. **Expo CLI**: Vous devez avoir Expo CLI installé. Si ce n'est pas déjà fait, vous pouvez l'installer avec npm :

   ```bash
   npm install -g expo-cli
   ```

3. **Compte Mapbox**: Vous aurez besoin d'une clé d'API Mapbox. Si vous n'en avez pas, créez un compte sur [Mapbox](https://www.mapbox.com/) et récupérez une clé d'API.

## Étapes d'installation

### 1. Créer un nouveau projet Expo

Si vous n'avez pas encore de projet Expo, créez-en un avec la commande suivante :

```bash
expo init my-mapbox-app
```

Naviguez dans votre projet :

```bash
cd my-mapbox-app
```

### 2. Ajouter Mapbox dans le projet

Mapbox ne fonctionne pas directement dans un projet Expo géré sans utiliser le mode "Custom Development". Voici les étapes pour configurer Mapbox :

#### a. Installation des dépendances nécessaires

Installez `react-native-mapbox-gl/maps`, qui est la bibliothèque permettant d'utiliser Mapbox dans une application React Native.

```bash
npm install @rnmapbox/maps
```

#### b. Configurer le projet pour le développement personnalisé

Mapbox nécessite un développement personnalisé pour Expo. Suivez ces étapes pour configurer cela :

1. Ajoutez Expo Development Client :

   ```bash
   npx expo install expo-dev-client
   ```

2. Configurez Expo pour le développement personnalisé :

   ```bash
   expo prebuild --clean
   ```

   Cela va générer les fichiers Android et iOS pour permettre l'ajout des modules natifs comme Mapbox.

3. Ajoutez votre clé d'API Mapbox dans votre fichier `app.json` ou `app.config.js` :

   ```json
   {
     "expo": {
       "plugins": [
         "expo-router",
         [
           "@rnmapbox/maps",
           {
             "RNMapboxMapsVersion": "11.6.1", // Choisissez la version de Mapbox que vous voulez utiliser
             "RNMapboxMapsDownloadToken": "YOUR_MAPBOX_ACCESS_TOKEN"
           }
         ]
       ]
     }
   }
   ```

4. Configurez Android en modifiant `android/app/src/main/AndroidManifest.xml` :

   ```xml
   <application>
     ...
     <meta-data
       android:name="com.mapbox.token"
       android:value="${MAPBOX_ACCESS_TOKEN}" />
   </application>
   ```

   Configurez iOS en modifiant `ios/yourProjectName/AppDelegate.m` pour ajouter votre clé Mapbox.

#### c. Build votre client personnalisé

Vous devez maintenant créer un client personnalisé pour utiliser Mapbox dans votre projet Expo.

```bash
expo run:android
# ou
expo run:ios
```

### 3. Utilisation de Mapbox dans votre code

Après avoir installé et configuré Mapbox, vous pouvez l'utiliser dans vos composants React Native. Voici un exemple de base :

```js
import React from 'react';
import MapboxGL from '@rnmapbox/maps';
import { View } from 'react-native';

MapboxGL.setAccessToken(process.env.MAPBOX_ACCESS_TOKEN);

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <MapboxGL.MapView style={{ flex: 1 }}>
        <MapboxGL.Camera zoomLevel={8} centerCoordinate={[-73.970895, 40.723279]} />
      </MapboxGL.MapView>
    </View>
  );
}
```

### 4. Lancer votre projet

Une fois que tout est configuré, vous pouvez lancer votre projet en utilisant Expo Go ou votre client de développement personnalisé.

```bash
npm start
```

Ouvrez l'application sur votre simulateur ou appareil en scannant le code QR avec l'application Expo Go ou via votre client personnalisé.

### 5. Déployer votre application

Pour déployer votre application, vous devrez utiliser EAS (Expo Application Services), qui permet de générer des builds pour des modules natifs comme Mapbox.

1. Configurez EAS si ce n'est pas encore fait :

   ```bash
   npm install -g eas-cli
   eas login
   ```

2. Générer un build pour iOS ou Android :
   ```bash
   eas build --platform ios
   # ou
   eas build --platform android
   ```

---

## Ressources supplémentaires

- [Documentation de @rnmapbox/maps](https://github.com/rnmapbox/maps)
- [Documentation officielle Expo](https://docs.expo.dev/)
- [API Mapbox](https://docs.mapbox.com/api/)

---

Cela devrait vous permettre de démarrer avec l'intégration de Mapbox dans votre projet Expo.
