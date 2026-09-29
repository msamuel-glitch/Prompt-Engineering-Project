# Synthetic course: simple linear regression (French)

Test input for the study-sheet prompts, identified as **S1** in the evaluations.
It imitates the text of a 12-slide PowerPoint course after extraction, with one
`[Slide N]` marker per slide. It was written for this project, so it can be
committed and shared.

It is short so that a run is quick and easy to check by hand. It also contains
traps described in the [study-sheet evaluation](../study-sheet/evaluation.md#s1-key-points-and-traps):
read them only after running a prompt if you want to judge the output blind.

Copy the block below as `{course_text}` (GitHub shows a copy button on hover).

```text
[Slide 1]
Régression linéaire simple
Statistiques appliquées — Séance 4

[Slide 2]
Objectifs de la séance
- Comprendre le modèle de régression linéaire simple
- Estimer les coefficients par la méthode des moindres carrés ordinaires (MCO)
- Interpréter la pente et l'ordonnée à l'origine
- Mesurer la qualité de l'ajustement avec le R²
- Connaître les hypothèses du modèle et ses limites

[Slide 3]
Le modèle
y = β0 + β1·x + ε
- y : variable expliquée (ou dépendante)
- x : variable explicative (ou indépendante)
- β0 : ordonnée à l'origine, valeur prédite de y quand x = 0
- β1 : pente, variation moyenne de y quand x augmente d'une unité
- ε : terme d'erreur, ce que x n'explique pas

[Slide 4]
Estimation par les moindres carrés ordinaires (MCO)
- Principe : choisir β0 et β1 qui minimisent la somme des carrés des résidus Σ (yi − ŷi)²
- Résidu : ei = yi − ŷi, écart entre la valeur observée et la valeur prédite
- Pente estimée : β̂1 = Cov(x, y) / Var(x)
- Ordonnée à l'origine estimée : β̂0 = ȳ − β̂1 · x̄
- La droite estimée passe toujours par le point moyen (x̄, ȳ)

[Slide 5]
Exemple : publicité et ventes
- Données : budget publicitaire mensuel (x, en k€) et ventes mensuelles (y, en k€) de 10 magasins
- Droite estimée : ŷ = 12 + 3,5x
- Interprétation de la pente : 1 k€ de publicité supplémentaire est associé en moyenne à 3,5 k€ de ventes en plus
- Interprétation de l'ordonnée à l'origine : 12 k€ de ventes prédites sans publicité, à prendre avec prudence si aucun magasin n'a un budget nul

[Slide 6]
Nuage de points et droite de régression
Voir le graphique ci-dessous.

[Slide 7]
Qualité de l'ajustement : le R²
- SCT = Σ (yi − ȳ)² : variabilité totale de y
- SCR = Σ (yi − ŷi)² : variabilité résiduelle, non expliquée par le modèle
- R² = 1 − SCR / SCT, compris entre 0 et 1
- Le R² est la part de la variance de y expliquée par x
- Dans l'exemple : R² = 0,81, soit 81 % de la variance des ventes expliquée par le budget publicitaire
- En régression simple, R² = r², le carré du coefficient de corrélation linéaire

[Slide 8]
Hypothèses du modèle
1. Linéarité : la relation entre x et y est linéaire
2. Indépendance des erreurs
3. Homoscédasticité : la variance des erreurs est constante
4. Normalité des erreurs, nécessaire pour les tests et les intervalles de confiance

[Slide 9]
Tester l'effet de x
- Hypothèse nulle H0 : β1 = 0 (x n'a pas d'effet linéaire sur y)
- Statistique de test : t = β̂1 / se(β̂1), qui suit une loi de Student à n − 2 degrés de liberté sous H0
- Si la p-value est inférieure à 0,05, on rejette H0 au seuil de 5 %
- Dans l'exemple : p < 0,001, l'effet du budget publicitaire est significatif

[Slide 10]
Pièges fréquents
- Corrélation n'est pas causalité : la régression mesure une association
- Extrapolation : ne pas prédire en dehors de l'intervalle des x observés
- Valeurs aberrantes : un seul point extrême peut fortement modifier la droite

[Slide 11]
Informations pratiques
- Le partiel aura lieu le 15 décembre
- Documents non autorisés, calculatrice autorisée

[Slide 12]
Questions ?
```
