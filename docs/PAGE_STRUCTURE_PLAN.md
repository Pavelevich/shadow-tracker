# SolPrivacy - Nueva Estructura de Página

## Problema Actual
La página post-análisis tiene **20+ secciones** - es abrumador para el usuario.

---

## Nueva Arquitectura Propuesta

### Homepage: 3 Tools Principales

```
┌─────────────────────────────────────────────────────────────┐
│                      SOLPRIVACY                              │
│            Privacy Tools for Solana                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│   │   🔍        │  │   🥪        │  │   🧹        │         │
│   │  PRIVACY    │  │    MEV      │  │   DUST      │         │
│   │  ANALYZER   │  │   SHIELD    │  │  CLEANER    │         │
│   │             │  │             │  │             │         │
│   │ Full wallet │  │ Sandwich    │  │ Remove spam │         │
│   │ privacy     │  │ attack risk │  │ & recover   │         │
│   │ analysis    │  │ analysis    │  │ SOL         │         │
│   └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│   [Enter Wallet Address................................]     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Tool 1: Privacy Analyzer (Existente, Simplificado)

**Ruta:** `/analyze/:wallet` o `/` con resultado

**Secciones (ordenadas por importancia):**

```
1. RESUMEN (Siempre visible)
   ├── Privacy Score (grande, central)
   ├── Risk Level badge
   ├── Top 3 alerts
   └── Export PDF button

2. QUICK ACTIONS (Collapsible, abierto por defecto)
   ├── "Mejora tu privacidad" - 3 acciones principales
   ├── Links a Light Protocol, Jupiter, etc.
   └── Score proyectado si actúas

3. DETAILED ANALYSIS (Collapsible, cerrado por defecto)
   ├── Attack Simulation
   ├── Identity Fingerprint
   ├── Temporal Analysis + Timezone Map
   ├── Metrics Grid
   └── K-Anonymity, Entropy, etc.

4. INTEGRATIONS (Collapsible, cerrado por defecto)
   ├── Light Protocol
   ├── Helius
   ├── Arcium
   └── encrypt.trade

5. FOOTER
   ├── Methodology
   ├── Wallet Comparison tool
   └── About
```

---

## Tool 2: MEV Shield (Nueva página dedicada)

**Ruta:** `/mev` o `/mev/:wallet`

**Secciones:**

```
1. HEADER
   └── "MEV Shield - Protect from Sandwich Attacks"

2. WALLET INPUT
   └── Enter wallet to analyze

3. MEV RISK SCORE
   ├── Circular gauge (0-100)
   ├── Risk level (LOW/MEDIUM/HIGH/CRITICAL)
   └── "You may have lost $X to MEV"

4. VULNERABILITY FACTORS
   ├── List of risk factors
   ├── Each with severity badge
   └── Points breakdown

5. SWAP ANALYSIS
   ├── Recent swaps count
   ├── DEX distribution chart
   ├── High-risk swap percentage
   └── Trading hours pattern

6. PROTECTION TOOLS
   ├── Jito Bundles CTA
   ├── Jupiter MEV protection
   ├── Slippage recommendations
   └── Code example for devs

7. EDUCATION
   └── "What is a Sandwich Attack?" explainer
```

---

## Tool 3: Dust Cleaner (Nueva página dedicada)

**Ruta:** `/dust` o `/dust/:wallet`

**Secciones:**

```
1. HEADER
   └── "Dust Cleaner - Remove Trackers & Recover SOL"

2. WALLET INPUT
   └── Enter wallet or connect wallet

3. SCAN RESULTS
   ├── Total accounts found
   ├── Spam tokens detected
   ├── Empty accounts
   └── Recoverable SOL amount

4. TRACKING ANALYSIS (DIFERENCIADOR)
   ├── "These tokens are TRACKING you"
   ├── Origin analysis (exchange, attacker, unknown)
   ├── Timeline of dust received
   └── Correlation with your activity

5. PRIVACY IMPACT
   ├── Current Privacy Score: 45
   ├── After cleanup: 58 (+13)
   └── Visual before/after

6. ACCOUNT LIST
   ├── Spam tokens (red, selected by default)
   ├── Empty accounts (amber)
   ├── Select all / none
   └── Blacklist option

7. CLEAN ACTION
   ├── "Clean X accounts, recover Y SOL"
   ├── Connect wallet to sign
   └── Alternative tools links
```

---

## Rutas de la Aplicación

```
/                     → Homepage con 3 tools
/analyze/:wallet      → Privacy Analyzer results
/mev                  → MEV Shield tool
/mev/:wallet          → MEV analysis results
/dust                 → Dust Cleaner tool
/dust/:wallet         → Dust analysis results
/compare              → Wallet comparison standalone
```

---

## Navegación

```
┌────────────────────────────────────────────────────────────┐
│ SOLPRIVACY    [Analyzer] [MEV Shield] [Dust Cleaner]  [?] │
└────────────────────────────────────────────────────────────┘
```

- Logo siempre lleva a home
- Tabs para cambiar entre tools
- ? para help/methodology

---

## Componentes a Crear/Modificar

### Nuevos Componentes
```
/src/pages/
  Home.tsx              → Nueva homepage con 3 tools
  MevShield.tsx         → Página dedicada MEV
  DustCleanerPage.tsx   → Página dedicada Dust

/src/components/
  ToolCard.tsx          → Card para seleccionar tool en home
  CollapsibleSection.tsx → Para colapsar secciones
  NavBar.tsx            → Nueva navegación
```

### Modificar
```
/src/pages/Index.tsx    → Simplificar, usar collapsibles
/src/App.tsx            → Agregar nuevas rutas
```

---

## Prioridad de Implementación

### Fase 1: Reorganizar (Hoy)
1. Crear nueva homepage con 3 tools
2. Agregar navegación
3. Simplificar página de análisis con collapsibles

### Fase 2: MEV Shield (Mañana)
1. Crear página dedicada /mev
2. Mejorar análisis de swaps
3. Agregar educación sobre MEV

### Fase 3: Dust Cleaner (Día 3)
1. Crear página dedicada /dust
2. Agregar tracking analysis
3. Privacy impact calculator
4. Timeline de dust

---

## Beneficios de Esta Estructura

1. **Menos abrumador** - Usuario elige qué quiere hacer
2. **3 productos claros** - Cada uno tiene valor propio
3. **Mejor para bounties** - Podemos demostrar cada tool por separado
4. **Escalable** - Fácil agregar más tools después
5. **SEO** - Cada tool tiene su propia URL

---

## Wireframe Visual

```
HOMEPAGE:
┌──────────────────────────────────────────┐
│            🔐 SOLPRIVACY                 │
│     Privacy Tools for Solana Wallets     │
│                                          │
│  ┌──────┐   ┌──────┐   ┌──────┐         │
│  │ 🔍   │   │ 🥪   │   │ 🧹   │         │
│  │Analyze│   │ MEV  │   │Dust  │         │
│  │      │   │Shield│   │Clean │         │
│  └──────┘   └──────┘   └──────┘         │
│                                          │
│  [_____Enter wallet address_____] [GO]   │
│                                          │
│  Powered by Helius • Light Protocol      │
└──────────────────────────────────────────┘

ANALYZE RESULTS (Simplified):
┌──────────────────────────────────────────┐
│ ← Back   SOLPRIVACY   [MEV] [Dust] [?]   │
├──────────────────────────────────────────┤
│                                          │
│     PRIVACY SCORE: 45                    │
│     ████████░░░░░░░░ MEDIUM RISK         │
│                                          │
│  ⚠️ 3 Critical Issues Found              │
│  • High exchange exposure                │
│  • Dust attack detected                  │
│  • Predictable timing patterns           │
│                                          │
│  [Export PDF]  [Improve Score →]         │
│                                          │
├──────────────────────────────────────────┤
│ ▼ Quick Actions                          │
│   → Use Light Protocol to shield...      │
│   → Clean 15 dust tokens...              │
│   → Randomize trading times...           │
├──────────────────────────────────────────┤
│ ▶ Detailed Analysis (click to expand)    │
├──────────────────────────────────────────┤
│ ▶ Protocol Integrations                  │
├──────────────────────────────────────────┤
│ ▶ Methodology                            │
└──────────────────────────────────────────┘
```

---

## Decisión Requerida

¿Procedemos con esta estructura de 3 tools separados?

- [ ] Sí, crear nueva homepage + rutas
- [ ] No, mantener todo en una página pero con collapsibles
- [ ] Otra idea: _____________
