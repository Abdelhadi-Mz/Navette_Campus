# Système de Suivi de Navette de Campus

<p align="center">
 <img width="500" height="500" alt="Untitled-1" src="https://github.com/user-attachments/assets/a7fdaee9-82eb-4ccd-9641-d8f977daa316" />

</p>

<p align="center">
  Système de suivi de navette en temps réel pour le transport sur campus
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-actif-brightgreen">
  <img src="https://img.shields.io/badge/platforme-Android%20%7C%20Web-blue">
  <img src="https://img.shields.io/badge/backend-API%20REST-orange">
  <img src="https://img.shields.io/badge/base%20de%20donn%C3%A9es-MySQL-blue">
  <img src="https://img.shields.io/badge/licence-Acad%C3%A9mique-lightgrey">
</p>

---

## 1. Vue d'ensemble

Le système de suivi de navette de campus est une application full-stack conçue pour surveiller et gérer le transport interne du campus en temps réel.

Il permet aux utilisateurs de suivre les déplacements des navettes entre les principaux emplacements du campus tels que les bâtiments, les résidences, la bibliothèque et le restaurant.

Fonctionnalités principales :
- Suivi GPS en temps réel
- Visualisation des trajets
- Estimation du temps d'arrivée (ETA)
- Tableau de bord d'administration

---

## 2. Acteurs

- Étudiant / Enseignant (Utilisateur mobile)
- Conducteur de navette
- Administrateur de transport (Interface web)

---

## 3. Architecture du système

### Architecture globale

```
"Application mobile (Android)
        |
        v
API Backend (REST - PHP / Node.js)
        |
        v
Base de données MySQL
        |
        v
Tableau de bord web (React)
        |
        v
Interface de suivi en temps réel"
```

### Flux du système

```
"Le conducteur envoie le GPS → API Backend → Base de données → Mise à jour en temps réel (Mobile + Web)"
```

---

## 4. Conception de la base de données

### Tables

#### shuttles
- id
- name
- status (actif, en pause, terminé)

#### stops
- id
- name
- latitude
- longitude
- order_index

#### shuttle_trips
- id
- shuttle_id
- status
- start_time
- end_time

#### positions
- id
- shuttle_id / trip_id
- latitude
- longitude
- timestamp

---

## 5. Application mobile (Android)

### Fonctionnalités utilisateur
- Voir les navettes actives
- Sélectionner une navette ou un trajet
- Suivi en temps réel sur carte
- Voir les arrêts
- Estimation du temps d'arrivée

### Fonctionnalités conducteur
- Démarrer un trajet
- Mettre à jour le statut de la navette
- Envoyer la position GPS périodiquement
- Signaler des retards (optionnel)

---

## 6. Application Web (Panneau d'administration React)

### Gestion des navettes
- Ajouter une navette
- Modifier une navette
- Supprimer une navette
- Assigner un conducteur
- Voir les navettes actives

### Gestion des arrêts
- Créer, modifier, supprimer des arrêts (nom, position, ordre)
- Définir la structure des trajets

### Tableau de bord en temps réel
- Carte en temps réel de toutes les navettes
- Dernières positions GPS
- Suivi du statut des navettes
- Historique des positions (optionnel)

---

## 7. Système de suivi en temps réel

```
"Application conducteur → Mise à jour GPS → API Backend → Base de données
                                  ↓
                       Tableau de bord web + utilisateurs mobiles"
```

---

## 8. Captures d'écran

### Application mobile

| Accueil | Carte | Détails |
|--------|-------|--------|
| ![Accueil](screenshots/mobile_home.png) | ![Carte](screenshots/mobile_map.png) | ![Détails](screenshots/mobile_details.png) |

### Tableau de bord Web

| Tableau de bord | Gestion des navettes | Suivi en temps réel |
|----------------|---------------------|---------------------|
| ![Dashboard](screenshots/web_dashboard.png) | ![Navettes](screenshots/web_shuttles.png) | ![Suivi](screenshots/web_tracking.png) |

---

## 9. Règles métier

- Un trajet appartient à une seule navette
- Chaque position est liée à une navette ou à un trajet
- Les navettes terminées arrêtent d'envoyer des données GPS
- Seules les navettes actives apparaissent dans le suivi en temps réel

---

## 10. Technologies utilisées

### Mobile
- Android (Java )
- Google Maps API

### Web
- React.js
- JavaScript / TypeScript

### Backend
- Node.js (API REST)
- Communication JSON

### Base de données
- MySQL

---

## 11. Objectifs du projet

- Construire un système de suivi en temps réel
- Améliorer la mobilité sur le campus
- Pratiquer le développement full-stack
- Intégrer mobile, web et backend

---

## 12. Structure du projet

```
"/mobile-app
/web-dashboard
/backend-api
/database
/assets
/screenshots"
```

---

## 13. Auteurs

Développé à l'École Normale Supérieure (ENS)

Auteur :
- Abdelhadi El Mezouari

Encadrant :
- Lachgar Mohamed

---

## 14. Démo et documentation

### Vidéos
- Tableau de bord admin : [Ajouter lien]
- Application mobile : [Ajouter lien]

### Diagrammes
- Diagramme de classes :<img width="242" height="453" alt="diagrammeClasslIv" src="https://github.com/user-attachments/assets/4352b09e-9a76-460c-99a9-b2c2c10bd4f5" />


- Diagramme de cas d'utilisation :<img width="3139" height="504" alt="DiagrammeUseCase" src="https://github.com/user-attachments/assets/c3f5103e-667b-4532-bb07-0f01c63282fc" />


### Rapport complet
- Rapport : [https://www.overleaf.com/read/bfhqmcttsgsc#8459eb]

---

## 15. Instructions d'installation

### Prérequis
- Node.js / PHP installés
- Serveur MySQL
- Android Studio

### Étapes
1. Cloner le dépôt
2. Configurer la base de données avec les scripts dans /database
3. Configurer l'API backend (variables d'environnement, connexion DB)
4. Lancer le serveur backend
5. Lancer l'application mobile avec Android Studio
6. Lancer le tableau de bord web :
   ```
   npm install
   npm start
   ```

---

## 16. Améliorations futures

- Prédiction ETA basée sur l'IA
- Notifications push
- Mode hors ligne pour les conducteurs
- Déploiement cloud (AWS / Firebase)
- Support multi-campus

---
