# 📋 Phase 6.0 – Sécurisation Stripe Webhook - COMPLETE

## 1. 📁 FICHIERS CRÉÉS

### Documentation
- **`PHASE_6.0_COMPLETE.md`** (ce fichier)
  - Compte-rendu complet de la phase 6.0
  - Explication de la vérification de signature
  - Guide de test avec Stripe CLI
  - Instructions pour la bascule TEST → LIVE
  - Explication des mécanismes de sécurité

## 2. ✏️ FICHIERS MODIFIÉS

### Backend Stripe
- **`src/server-stripe.js`**
  - Ajout du système de logs de sécurité (`stripe-security.log`)
  - Amélioration de la vérification de signature avec logs détaillés
  - Amélioration de la protection anti-replay avec logs
  - Filtrage strict des types d'events (uniquement `checkout.session.completed`)
  - Ajout d'un rate limiting simple (10 requêtes/minute par IP)
  - Gestion d'erreurs améliorée avec logs de sécurité

## 3. ⚙️ COMPORTEMENT AJOUTÉ / MODIFIÉ

### Vérification de signature Stripe
- **Raw body obligatoire** : Utilisation de `express.raw({ type: 'application/json' })`
- **Vérification stricte** : `stripe.webhooks.constructEvent(req.body, sig, webhookSecret)`
- **Logs de sécurité** : Toutes les tentatives (valides et invalides) sont loguées
- **Réponse sécurisée** : 400 en cas de signature invalide, sans traiter l'event

### Protection Anti-Replay
- **Tracking des events** : Set `processedEvents` pour stocker les IDs d'events traités
- **Détection automatique** : Si un `event.id` est déjà dans le Set, l'event est ignoré
- **Logs de sécurité** : Tous les replays sont logués avec `REPLAY_DETECTED`
- **Réponse Stripe-friendly** : Retourne 200 pour garder Stripe content, mais ne traite pas

### Filtrage des types d'events
- **Whitelist stricte** : Uniquement `checkout.session.completed` est traité
- **Events ignorés** : Tous les autres types sont logués comme `IGNORED_EVENT_TYPE`
- **Réponse Stripe-friendly** : Retourne 200 pour les events ignorés

### Rate Limiting
- **Limite** : 10 requêtes par minute par IP
- **Stockage** : Map en mémoire avec compteur et timestamp de reset
- **Réponse** : 429 (Too Many Requests) si limite dépassée
- **Logs** : Tous les dépassements sont logués comme `RATE_LIMIT_EXCEEDED`

### Logs de sécurité
- **Fichier dédié** : `logs/stripe-security.log`
- **Format JSON** : Une ligne par événement avec tous les détails
- **Champs logués** :
  - `timestamp` : ISO 8601
  - `ip` : Adresse IP du client
  - `event_id` : ID de l'event Stripe (si disponible)
  - `event_type` : Type d'event Stripe (si disponible)
  - `signature_valid` : true/false/null
  - `replay` : true/false
  - `rate_limited` : true/false
  - `reason` : Raison du log (INVALID_SIGNATURE, REPLAY_DETECTED, etc.)
- **Sécurité** : Aucune clé secrète ou donnée sensible n'est loguée

## 4. 🔧 POINTS TECHNIQUES IMPORTANTS

### Contraintes respectées
- ✅ **Flux actuel préservé** : `checkout.session.completed` continue à ajouter des crédits
- ✅ **Logique métier intacte** : Aucune modification de la logique d'ajout de crédits
- ✅ **Backend dubbing non touché** : `server-dub.js` reste inchangé
- ✅ **Frontend non modifié** : Aucun changement côté frontend

### Choix techniques

#### 1. Raw Body pour signature
- **Raison** : Stripe nécessite le body brut (Buffer) pour vérifier la signature
- **Solution** : `express.raw({ type: 'application/json' })` sur l'endpoint webhook uniquement
- **Important** : `req.body` est un Buffer, pas un objet JSON parsé
- **Vérification** : `stripe.webhooks.constructEvent(req.body, sig, webhookSecret)`

#### 2. Rate Limiting en mémoire
- **Raison** : Simple et efficace pour un usage modéré
- **Solution** : Map avec compteur et timestamp de reset
- **Limite** : 10 requêtes/minute par IP
- **Note** : En production avec plusieurs instances, utiliser Redis ou un service dédié

#### 3. Anti-Replay avec Set
- **Raison** : Éviter de traiter deux fois le même event
- **Solution** : Set JavaScript pour stocker les IDs d'events
- **Limite** : 200 events maximum (rotation automatique)
- **Note** : En production, utiliser une base de données pour persistance

#### 4. Filtrage strict des events
- **Raison** : Sécurité et simplicité
- **Solution** : Whitelist avec uniquement `checkout.session.completed`
- **Avantage** : Réduit la surface d'attaque
- **Note** : Facile d'ajouter d'autres types si nécessaire

#### 5. Logs de sécurité JSON
- **Raison** : Facile à parser et analyser
- **Solution** : Une ligne JSON par événement
- **Avantage** : Peut être analysé avec des outils comme `jq` ou importé dans un SIEM
- **Sécurité** : Aucune donnée sensible n'est loguée

### Structure des logs de sécurité

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "ip": "192.168.1.100",
  "event_id": "evt_1234567890",
  "event_type": "checkout.session.completed",
  "signature_valid": true,
  "replay": false,
  "rate_limited": false,
  "reason": "PROCESSED_SUCCESSFULLY"
}
```

### Raisons possibles dans les logs

- `INVALID_SIGNATURE` : Signature Stripe invalide
- `SIGNATURE_HEADER_MISSING` : Header `stripe-signature` absent
- `WEBHOOK_SECRET_MISSING` : Secret webhook non configuré
- `REPLAY_DETECTED` : Event déjà traité (même `event.id`)
- `IGNORED_EVENT_TYPE` : Type d'event non autorisé
- `RATE_LIMIT_EXCEEDED` : Trop de requêtes
- `PROCESSED_SUCCESSFULLY` : Event traité avec succès
- `CREDITS_ADD_FAILED` : Échec d'ajout de crédits
- `NO_CREDITS_IN_METADATA` : Pas de crédits dans les métadonnées
- `PROCESSING_ERROR` : Erreur lors du traitement

## 5. 🧪 TESTS À EFFECTUER

### Tests avec Stripe CLI

#### 1. Installation Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
# Télécharger depuis https://stripe.com/docs/stripe-cli
```

#### 2. Connexion à Stripe
```bash
stripe login
```

#### 3. Écouter les webhooks localement
```bash
# Forwarder les webhooks vers votre serveur local
stripe listen --forward-to http://localhost:3003/api/stripe/webhook

# Le CLI affichera un webhook signing secret (whsec_...)
# Copiez-le et ajoutez-le à votre .env :
# STRIPE_WEBHOOK_SECRET_TEST=whsec_...
```

#### 4. Déclencher un event de test
```bash
# Déclencher un checkout.session.completed
stripe trigger checkout.session.completed

# Vérifier les logs
tail -f logs/stripe-security.log
```

#### 5. Tester la signature invalide
```bash
# Envoyer une requête avec une signature invalide
curl -X POST http://localhost:3003/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: invalid_signature" \
  -d '{"type":"checkout.session.completed","id":"evt_test"}'

# Vérifier que INVALID_SIGNATURE est logué
```

#### 6. Tester le rate limiting
```bash
# Envoyer 11 requêtes rapidement
for i in {1..11}; do
  stripe trigger checkout.session.completed
  sleep 0.1
done

# La 11ème devrait retourner 429
# Vérifier que RATE_LIMIT_EXCEEDED est logué
```

#### 7. Tester le replay
```bash
# Déclencher le même event deux fois
stripe trigger checkout.session.completed
# Attendre quelques secondes
stripe trigger checkout.session.completed

# La deuxième fois devrait être ignorée
# Vérifier que REPLAY_DETECTED est logué
```

#### 8. Tester un event type non autorisé
```bash
# Déclencher un autre type d'event
stripe trigger payment_intent.succeeded

# Devrait être ignoré
# Vérifier que IGNORED_EVENT_TYPE est logué
```

### Tests manuels

#### 9. Vérifier les logs de sécurité
```bash
# Lire les logs
cat logs/stripe-security.log

# Analyser avec jq (si installé)
cat logs/stripe-security.log | jq 'select(.replay == true)'
cat logs/stripe-security.log | jq 'select(.signature_valid == false)'
```

#### 10. Vérifier le flux complet
1. Créer un checkout depuis le frontend
2. Compléter le paiement
3. Vérifier que le webhook est reçu
4. Vérifier que les crédits sont ajoutés
5. Vérifier les logs de sécurité

## 6. ⚠️ NOTES / LIMITES

### Limitations connues

1. **Rate limiting en mémoire**
   - Le rate limiting est stocké en mémoire
   - **Impact** : Perdu au redémarrage, ne fonctionne pas avec plusieurs instances
   - **Solution production** : Utiliser Redis ou un service dédié

2. **Anti-replay en mémoire**
   - Les events traités sont stockés en mémoire
   - **Impact** : Perdu au redémarrage, limite de 200 events
   - **Solution production** : Utiliser une base de données (PostgreSQL, MongoDB)

3. **Logs de sécurité locaux**
   - Les logs sont stockés localement
   - **Impact** : Perdus si le serveur crash, pas de rotation automatique
   - **Solution production** : Utiliser un service de logging (CloudWatch, Loggly, etc.)

### Bascule TEST → LIVE

#### Étapes pour passer en production

1. **Créer un endpoint webhook dans Stripe Dashboard**
   - Aller dans Stripe Dashboard > Developers > Webhooks
   - Cliquer sur "Add endpoint"
   - URL : `https://votre-domaine.com/api/stripe/webhook`
   - Events à écouter : `checkout.session.completed`

2. **Récupérer le webhook signing secret LIVE**
   - Dans Stripe Dashboard > Developers > Webhooks
   - Cliquer sur votre endpoint
   - Copier le "Signing secret" (commence par `whsec_live_...`)

3. **Configurer les variables d'environnement**
   ```bash
   # .env ou variables d'environnement du serveur
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_live_...
   ```

4. **Vérifier la configuration**
   - Le serveur doit utiliser les clés LIVE
   - Le webhook doit pointer vers votre URL de production
   - Les logs de sécurité doivent être activés

5. **Tester en production**
   - Effectuer un vrai paiement de test (montant minimal)
   - Vérifier que le webhook est reçu
   - Vérifier que les crédits sont ajoutés
   - Vérifier les logs de sécurité

### Ce qui se passe en cas de...

#### Signature invalide
- **Action** : Event rejeté avec 400
- **Log** : `INVALID_SIGNATURE` dans `stripe-security.log`
- **Crédits** : Non ajoutés
- **Stripe** : Stripe réessaiera automatiquement (exponential backoff)

#### Event ignoré (type non autorisé)
- **Action** : Event ignoré, retourne 200
- **Log** : `IGNORED_EVENT_TYPE` dans `stripe-security.log`
- **Crédits** : Non ajoutés
- **Stripe** : Stripe considère l'event comme traité

#### Replay détecté
- **Action** : Event ignoré, retourne 200
- **Log** : `REPLAY_DETECTED` dans `stripe-security.log`
- **Crédits** : Non ajoutés (déjà ajoutés précédemment)
- **Stripe** : Stripe considère l'event comme traité

#### Rate limit dépassé
- **Action** : Requête rejetée avec 429
- **Log** : `RATE_LIMIT_EXCEEDED` dans `stripe-security.log`
- **Crédits** : Non ajoutés
- **Stripe** : Stripe réessaiera automatiquement

### Bonnes pratiques

1. **Surveiller les logs de sécurité**
   - Vérifier régulièrement `stripe-security.log`
   - Alerter en cas de nombreuses tentatives invalides
   - Analyser les patterns suspects

2. **Rotation des logs**
   - Implémenter une rotation des logs (ex: logrotate)
   - Garder les logs pendant au moins 30 jours
   - Archiver les anciens logs

3. **Monitoring**
   - Surveiller le taux de succès des webhooks
   - Alerter en cas de nombreux échecs
   - Surveiller le rate limiting

4. **Tests réguliers**
   - Tester le webhook après chaque déploiement
   - Vérifier que les logs fonctionnent
   - Tester les cas d'erreur

### Ce qui n'a pas été touché

- ✅ Logique d'ajout de crédits (inchangée)
- ✅ Backend dubbing (server-dub.js non modifié)
- ✅ Frontend (aucun changement)
- ✅ Autres endpoints (checkout, credits, etc. inchangés)

---

## 📝 Guide de test avec Stripe CLI

### Installation
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
# Télécharger depuis https://stripe.com/docs/stripe-cli
```

### Connexion
```bash
stripe login
```

### Écouter les webhooks
```bash
# Forwarder vers votre serveur local
stripe listen --forward-to http://localhost:3003/api/stripe/webhook

# Copier le webhook signing secret affiché
# Ajouter à .env : STRIPE_WEBHOOK_SECRET_TEST=whsec_...
```

### Déclencher des events
```bash
# Event autorisé
stripe trigger checkout.session.completed

# Event ignoré
stripe trigger payment_intent.succeeded

# Vérifier les logs
tail -f logs/stripe-security.log
```

---

**Phase 6.0 terminée avec succès** ✅

Le webhook Stripe est maintenant complètement sécurisé avec :
- ✅ Vérification de signature stricte
- ✅ Protection anti-replay
- ✅ Filtrage des types d'events
- ✅ Rate limiting
- ✅ Logs de sécurité complets

