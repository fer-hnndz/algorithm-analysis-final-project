# Recursos multimedia de la experiencia SAT

Colocá aquí los assets (todos son opcionales: la UI tiene fallbacks).

```
public/sat/
  intro-linguini-soup.mp4   (video de intro a pantalla completa CON audio; fallback: se salta)
  kitchen-bg.mp4            (video de fondo en loop de la interfaz; fallback: gradiente oscuro cálido)
  remy-guide.png            (imagen de Remy para el diálogo; fallback: 🐭)
  ingredients/
    tomato.png  cheese.png  onion.png  mushroom.png
    basil.png   pepper.png  garlic.png butter.png   (fallback: emoji de cada ingrediente)
  audio/
    kitchen-theme.ogg        (música de fondo, opcional, no autoplay)
    success.ogg  error.ogg  click.ogg  (fallan en silencio si no existen)
```

Si un archivo falta, la interfaz sigue funcionando con gradientes, emojis o
placeholders. No es necesario subir todos los assets para que la página corra.
