# 🎙️ Extension de l'API /api/dub - Langue & Voix

## ✅ Modifications apportées

### 1. Listes blanches de validation

**Langues supportées** (`SUPPORTED_LANGUAGES_BACKEND`) :
- Format complet avec locale : `"fr-FR"`, `"en-US"`, `"es-ES"`, etc.
- 40+ langues supportées (Europe, Amériques, Asie, Moyen-Orient)

**Voix supportées** (`SUPPORTED_VOICES_BACKEND`) :
- `alloy`, `nova`, `shimmer`, `verse`, `echo`, `fable`, `onyx`, `wind`, `robotic`, `sage`, `coral`

### 2. Fonctions de validation

- `validateAndNormalizeLanguage(languageCode)` : Valide et normalise la langue
  - Accepte format complet (`"fr-FR"`) ou court (`"fr"`)
  - Fallback sur `"en-US"` si invalide
  - Retourne code complet + code court

- `validateVoice(voiceId)` : Valide la voix
  - Fallback sur `"nova"` si invalide ou absente

### 3. Logs améliorés

Tous les logs sont maintenant préfixés avec `[DUBBING]` et en français :
- Langue demandée → résolue
- Voix demandée → résolue
- Configuration finale avant appel OpenAI TTS

## 📡 Signature de la route `/api/dub`

### Endpoint
```
POST /api/dub
```

### Headers
```
Content-Type: multipart/form-data
x-user-id: <userId> (optionnel, défaut: 'anonymous')
```

### Body (FormData)
```javascript
{
  file: File,                    // Fichier audio/vidéo (requis)
  targetLanguage: string,        // Code langue (optionnel, format: "fr-FR" ou "fr")
  voiceModel: string,            // ID de la voix (optionnel, ex: "nova", "shimmer")
  sourceLanguage: string         // Langue source (optionnel, non utilisé actuellement)
}
```

### Réponse (succès)
```json
{
  "ok": true,
  "audioUrl": "/output/dub-1234567890.mp3",
  "jobId": "1234567890",
  "message": "Dub generated successfully",
  "provider": "openai",
  "targetLanguage": "fr-FR",        // Code complet résolu
  "voiceModel": "nova",             // Voix résolue
  "creditsUsed": 5,
  "creditsRemaining": 95
}
```

### Réponse (erreur)
```json
{
  "ok": false,
  "error": "NOT_ENOUGH_CREDITS",
  "credits": 2,
  "required": 5,
  "message": "Vous avez besoin de 5 crédits pour ce doublage (2 disponibles)"
}
```

## 🔄 Comportement de validation

### Langue (`targetLanguage`)

| Input | Résultat | Code court utilisé |
|-------|----------|-------------------|
| `"fr-FR"` | ✅ `"fr-FR"` | `"fr"` |
| `"en-US"` | ✅ `"en-US"` | `"en"` |
| `"fr"` | ✅ `"fr-FR"` (normalisé) | `"fr"` |
| `"invalid"` | ⚠️ `"en-US"` (fallback) | `"en"` |
| `undefined` | ⚠️ `"en-US"` (fallback) | `"en"` |

### Voix (`voiceModel`)

| Input | Résultat |
|-------|----------|
| `"nova"` | ✅ `"nova"` |
| `"shimmer"` | ✅ `"shimmer"` |
| `"invalid"` | ⚠️ `"nova"` (fallback) |
| `undefined` | ⚠️ `"nova"` (fallback) |

## 📋 Exemple de logs complets

### Cas 1 : Requête avec langue et voix valides

```
[DUBBING] Requête reçue — userId: user123
[DUBBING] Langue demandée: fr-FR → résolue: fr-FR (code court: fr)
[DUBBING] Voix demandée: shimmer → résolue: shimmer
[DUBBING] Fichier: upload-1234567890.mp3 (2.45 MB)
💰 Estimated duration: 25s → 5 credits required
✅ Credits check passed: 100 >= 5
💸 Credits deducted: -5 (new balance: 95)
🤖 Using OpenAI TTS for dubbing...
[DUBBING] Configuration finale — Langue: fr-FR (fr), Voix: shimmer
🔊 [OpenAI TTS] Appel API — model: gpt-4o-mini-tts, voice: shimmer, language: fr
✅ Dub saved: /output/dub-1234567890.mp3
[DUBBING] ✅ Doublage généré avec succès — Langue: fr-FR, Voix: shimmer, Provider: openai
```

### Cas 2 : Requête avec langue invalide (fallback)

```
[DUBBING] Requête reçue — userId: user456
⚠️  Langue non supportée: invalid-lang, fallback sur en-US
[DUBBING] Langue demandée: invalid-lang → résolue: en-US (code court: en)
[DUBBING] Voix demandée: non spécifiée → résolue: nova
[DUBBING] Fichier: upload-9876543210.mp3 (1.23 MB)
💰 Estimated duration: 12s → 3 credits required
✅ Credits check passed: 50 >= 3
💸 Credits deducted: -3 (new balance: 47)
🤖 Using OpenAI TTS for dubbing...
[DUBBING] Configuration finale — Langue: en-US (en), Voix: nova
🔊 [OpenAI TTS] Appel API — model: gpt-4o-mini-tts, voice: nova, language: en
✅ Dub saved: /output/dub-9876543210.mp3
[DUBBING] ✅ Doublage généré avec succès — Langue: en-US, Voix: nova, Provider: openai
```

### Cas 3 : Requête sans paramètres (fallback complet)

```
[DUBBING] Requête reçue — userId: anonymous
[DUBBING] Langue demandée: non spécifiée → résolue: en-US (code court: en)
[DUBBING] Voix demandée: non spécifiée → résolue: nova
[DUBBING] Fichier: upload-1111111111.mp3 (0.89 MB)
💰 Estimated duration: 9s → 2 credits required
✅ Credits check passed: 20 >= 2
💸 Credits deducted: -2 (new balance: 18)
🤖 Using OpenAI TTS for dubbing...
[DUBBING] Configuration finale — Langue: en-US (en), Voix: nova
🔊 [OpenAI TTS] Appel API — model: gpt-4o-mini-tts, voice: nova, language: en
✅ Dub saved: /output/dub-1111111111.mp3
[DUBBING] ✅ Doublage généré avec succès — Langue: en-US, Voix: nova, Provider: openai
```

## 🔒 Sécurité

✅ **Listes blanches** : Seules les langues et voix validées sont acceptées
✅ **Fallback sûr** : Valeurs par défaut si paramètres invalides
✅ **Pas de breaking change** : Comportement actuel préservé si paramètres absents
✅ **Logs explicites** : Traçabilité complète des choix de langue/voix

## 🎯 Compatibilité

- ✅ **Frontend** : Accepte `targetLanguage` (format "fr-FR") et `voiceModel` (ex: "nova")
- ✅ **Backend** : Valide et normalise les paramètres
- ✅ **OpenAI TTS** : Utilise le code court de langue (ex: "fr") et la voix validée
- ✅ **Rétrocompatibilité** : Fonctionne avec ou sans les nouveaux paramètres

## 📝 Notes techniques

1. **Format de langue** : Le frontend envoie `"fr-FR"`, le backend le normalise et utilise `"fr"` pour OpenAI TTS
2. **Voix par défaut** : `"nova"` si non spécifiée ou invalide
3. **Langue par défaut** : `"en-US"` si non spécifiée ou invalide
4. **Logs** : Tous préfixés `[DUBBING]` pour faciliter le filtrage sur Render

