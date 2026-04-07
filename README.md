<div id="top">

<div align="center">

# GOALS TRACKER

<em>Application de suivi d'objectifs et d'habitudes — projet personnel</em>

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

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Démarrage rapide](#démarrage-rapide)
  - [Prérequis](#prérequis)
  - [Installation](#installation)
  - [Variables d'environnement](#variables-denvironnement)
  - [Lancer en local](#lancer-en-local)
- [Déploiement](#déploiement)
- [Roadmap](#roadmap)

---

## Aperçu

**Goals Tracker** est une application web full-stack permettant de suivre ses objectifs personnels à différentes échelles de temps. Elle distingue trois types d'éléments : les **tâches quotidiennes** (ponctuelles), les **habitudes récurrentes** (avec système de streaks), et les **objectifs long terme** (décomposés en étapes avec progression en pourcentage).

Les données sont synchronisées dans le cloud via **Supabase** avec authentification par email, et l'app est déployée sur **Vercel**. Elle est installable sur smartphone en tant que PWA.

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

## Démarrage rapide

### Prérequis

- **Node.js v20+**
- **npm**
- Un compte **Supabase** (gratuit)

### Installation

```sh
# Cloner le dépôt
git clone https://github.com/anatolesns/Goals-Tracker
cd goals-tracker

# Installer les dépendances
npm install
```

### Variables d'environnement

Crée un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=https://ton-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=ta_clé_anon_publique
```

Ces valeurs se trouvent dans Supabase → **Settings → API**.

### Base de données

Dans l'éditeur SQL de Supabase, exécute le script suivant pour créer les tables :

```sql
create extension if not exists "uuid-ossp";

create table goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'not_started',
  progress integer default 0,
  milestones jsonb default '[]',
  start_date date default current_date,
  due_date date,
  category text,
  color text,
  created_at timestamptz default now()
);

create table habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  frequency text default 'daily',
  completed_dates text[] default '{}',
  streak integer default 0,
  best_streak integer default 0,
  color text,
  created_at timestamptz default now()
);

create table daily_tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  done boolean default false,
  date date default current_date,
  created_at timestamptz default now()
);

alter table goals enable row level security;
alter table habits enable row level security;
alter table daily_tasks enable row level security;

create policy "goals_own" on goals for all using (auth.uid() = user_id);
create policy "habits_own" on habits for all using (auth.uid() = user_id);
create policy "tasks_own" on daily_tasks for all using (auth.uid() = user_id);
```

### Lancer en local

```sh
npm run dev
```

L'app est disponible sur `http://localhost:5173`.

---

## Déploiement

L'app est déployée sur **Vercel** avec redéploiement automatique à chaque push sur `main`.

```sh
# Build de production
npm run build

# Push → déclenche automatiquement le redéploiement Vercel
git add .
git commit -m "description"
git push
```

Pense à ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans **Vercel → Settings → Environment Variables**.

Le fichier `vercel.json` à la racine configure le routing pour la SPA :

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
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
