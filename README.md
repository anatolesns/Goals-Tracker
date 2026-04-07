<div id="top">

<div align="center">

# GOALS TRACKER

<em>Application de suivi d'objectifs et d'habitudes — projet personnel</em>

<br/>

<a href="https://goals-tracker.vercel.app">
  <img src="https://img.shields.io/badge/🌐 Accéder à l'app-goals--tracker.vercel.app-6366f1?style=for-the-badge" alt="app link">
</a>

<!-- BADGES -->
<img src="https://img.shields.io/badge/react-18-61DAFB?style=default&logo=react&logoColor=white" alt="react">
<img src="https://img.shields.io/badge/typescript-5-3178C6?style=default&logo=typescript&logoColor=white" alt="typescript">
<img src="https://img.shields.io/badge/vite-8-646CFF?style=default&logo=vite&logoColor=white" alt="vite">
<img src="https://img.shields.io/badge/supabase-cloud-3ECF8E?style=default&logo=supabase&logoColor=white" alt="supabase">
<img src="https://img.shields.io/badge/tailwindcss-4-06B6D4?style=default&logo=tailwindcss&logoColor=white" alt="tailwind">
<img src="https://img.shields.io/badge/deployed-vercel-000000?style=default&logo=vercel&logoColor=white" alt="vercel">

</div>

> Application web progressive (PWA) pour gérer ses objectifs quotidiens, habitudes récurrentes et objectifs long terme, avec statistiques d'avancement et système de rappels.

---

## Table des matières

- [Contexte](#contexte)
- [Accès et utilisation](#accès-et-utilisation)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Roadmap](#roadmap)

---

## Contexte

**Goals Tracker** est un projet personnel développé avec deux objectifs : **apprendre TypeScript** en conditions réelles, et **répondre à un besoin concret** — l'absence d'un outil simple qui regroupe à la fois les tâches du jour, les habitudes récurrentes et les objectifs long terme dans une seule interface.

Plutôt que d'utiliser plusieurs apps séparées (todo list, habit tracker, notion...), l'idée était de construire quelque chose de léger, rapide et adapté à mon usage quotidien. Le projet a été l'occasion de travailler avec un stack moderne (React, TypeScript, Vite, Zustand, Supabase) de bout en bout : modélisation des données, logique métier, interface, statistiques, authentification et déploiement.

---

## Accès et utilisation

🌐 **L'app est disponible ici : [goals-tracker.vercel.app](https://goals-tracker.vercel.app)**

Elle est installable sur smartphone en tant que PWA :
- **Android** — ouvre le lien dans Chrome, puis "Ajouter à l'écran d'accueil"
- **iPhone** — ouvre le lien dans Safari, appuie sur ⎙ puis "Sur l'écran d'accueil"

### Créer un compte

Rends-toi sur l'app, entre ton email et un mot de passe, puis clique sur **Créer le compte**. Tes données sont liées à ton compte et synchronisées sur tous tes appareils.

### Onglet Aujourd'hui

L'onglet principal regroupe les **tâches du jour** et les **habitudes**. Coche une tâche pour la marquer comme faite — elle disparaîtra automatiquement le lendemain. Pour les habitudes, cocher chaque jour incrémente ton streak 🔥. Passe la souris sur un élément (ou appuie longtemps sur mobile) pour afficher les boutons de modification et de suppression.

### Onglet Objectifs

Crée tes objectifs long terme et décompose-les en **étapes (milestones)**. La barre de progression se met à jour automatiquement à chaque étape cochée. Tu peux définir une date d'échéance et une description pour chaque objectif.

### Onglet Stats

Visualise tes données sur le temps : **heatmap** des habitudes sur 12 semaines, **graphique de complétion** sur 14 jours, tendances des streaks et progression de chaque objectif.

### Onglet Rappels

Active des **notifications quotidiennes** pour tes habitudes en choisissant une heure pour chacune. Les notifications fonctionnent tant que l'onglet est ouvert — ou en permanence si l'app est installée en PWA.

---

## Fonctionnalités

- **Tâches du jour** — ajout, complétion et suppression de tâches quotidiennes
- **Habitudes récurrentes** — suivi quotidien, calcul automatique des streaks et meilleur streak
- **Objectifs long terme** — décomposition en milestones, barre de progression automatique
- **Édition** — modification du titre, description, échéance et fréquence de chaque élément
- **Statistiques** — heatmap sur 12 semaines, graphiques de complétion sur 14 jours, tendances
- **Rappels** — notifications web programmables par habitude avec heure personnalisée
- **Authentification** — inscription et connexion par email via Supabase Auth
- **Sync cloud** — données synchronisées en temps réel entre appareils
- **PWA** — installable sur Android et iOS (via Safari)

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | React 18 + TypeScript |
| Build | Vite 8 |
| Style | Tailwind CSS 4 |
| State | Zustand (avec persist middleware) |
| Base de données | Supabase (PostgreSQL) |
| Authentification | Supabase Auth |
| Graphiques | Recharts |
| Dates | date-fns |
| Déploiement | Vercel |

---

## Structure du projet

```sh
└── goals-tracker/
    ├── public/
    │   ├── pwa-192x192.png        # Icône PWA
    │   ├── pwa-512x512.png        # Icône PWA grande
    │   └── sw-notifications.js    # Service Worker notifications
    └── src/
        ├── components/
        │   ├── AddItemModal.tsx    # Modal d'ajout (objectif / habitude / tâche)
        │   ├── EditModal.tsx       # Modal d'édition
        │   ├── DailyView.tsx       # Vue tâches et habitudes du jour
        │   ├── GoalsView.tsx       # Vue objectifs long terme
        │   ├── StatsView.tsx       # Vue statistiques et graphiques
        │   ├── NotificationsView.tsx # Vue rappels
        │   └── AuthScreen.tsx      # Écran de connexion / inscription
        ├── hooks/
        │   └── useSync.ts          # Synchronisation Supabase ↔ Zustand
        ├── lib/
        │   └── supabase.ts         # Client Supabase
        ├── store/
        │   └── useAppStore.ts      # Store Zustand (goals, habits, dailyTasks)
        ├── types/
        │   └── index.ts            # Interfaces TypeScript (Goal, Habit, DailyTask...)
        ├── utils/
        │   ├── goalUtils.ts        # Calcul progression, streaks, ID
        │   └── notifications.ts    # Gestion notifications et Service Worker
        ├── theme.ts                # Thèmes par onglet
        └── App.tsx                 # Composant racine + gestion session
```

---

## Roadmap

- [x] Modélisation TypeScript des données
- [x] Persistance locale (Zustand + localStorage)
- [x] Interface complète (tâches, habitudes, objectifs)
- [x] Statistiques et graphiques (Recharts)
- [x] Notifications web et rappels quotidiens
- [x] Authentification Supabase
- [x] Synchronisation cloud multi-appareils
- [x] Déploiement Vercel
- [x] PWA installable (Android + iOS)
- [ ] Export / import JSON des données
- [ ] Vue semaine des habitudes
- [ ] Mode sombre
- [ ] Partage d'objectifs entre utilisateurs

<div align="right">

[![][back-to-top]](#top)

</div>

[back-to-top]: https://img.shields.io/badge/-RETOUR_EN_HAUT-151515?style=flat-square
