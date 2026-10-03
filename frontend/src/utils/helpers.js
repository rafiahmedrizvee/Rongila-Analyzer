// Central reference data for the 8-class skin tone scale used across the app.
// Class names and swatch colors are illustrative for the prototype UI; the
// production version will map directly to the labels used in the trained
// model's class_names.json.

export const SKIN_TONE_CLASSES = [
  {
    id: 'very_fair',
    label: 'Very Fair',
    swatch: '#F3DFCF',
    note: 'Burns easily, rarely tans',
  },
  {
    id: 'fair',
    label: 'Fair',
    swatch: '#EACBAA',
    note: 'Burns easily, tans minimally',
  },
  {
    id: 'light',
    label: 'Light',
    swatch: '#DEB48C',
    note: 'Sometimes burns, tans gradually',
  },
  {
    id: 'medium',
    label: 'Medium',
    swatch: '#C58F62',
    note: 'Rarely burns, tans well',
  },
  {
    id: 'olive',
    label: 'Olive',
    swatch: '#AD7C4C',
    note: 'Rarely burns, tans easily',
  },
  {
    id: 'tan',
    label: 'Tan',
    swatch: '#8F5D34',
    note: 'Very rarely burns',
  },
  {
    id: 'brown',
    label: 'Brown',
    swatch: '#6B4226',
    note: 'Almost never burns',
  },
  {
    id: 'deep',
    label: 'Deep',
    swatch: '#402716',
    note: 'Never burns',
  },
]

export const GUIDANCE_BY_CLASS = {
  very_fair: baseGuidance('SPF 30–50+', ['Fragrance-free moisturizer', 'Avoid peak-hour sun exposure']),
  fair: baseGuidance('SPF 30–50+', ['Lightweight moisturizer', 'Reapply sunscreen every 2 hours outdoors']),
  light: baseGuidance('SPF 30+', ['Gel or lotion moisturizer', 'Antioxidant serum if suitable for your routine']),
  medium: baseGuidance('SPF 30+', ['Balanced moisturizer', 'Antioxidant-focused routine if suitable']),
  olive: baseGuidance('SPF 30+', ['Balanced moisturizer', 'Vitamin C serum if suitable for your routine']),
  tan: baseGuidance('SPF 30+ (broad-spectrum)', ['Hydrating, non-stripping cleanser', 'Consistent daily sun protection']),
  brown: baseGuidance('SPF 30+ (broad-spectrum)', ['Rich, hydrating moisturizer', 'Avoid harsh exfoliants']),
  deep: baseGuidance('SPF 30+ (broad-spectrum)', ['Rich, hydrating moisturizer', 'Avoid harsh exfoliants']),
}

function baseGuidance(spf, extras) {
  return {
    morning: ['Gentle cleanser', 'Moisturizer', `Broad-spectrum sunscreen, ${spf}`],
    evening: ['Gentle cleanser', 'Moisturizer', ...extras.slice(0, 1)],
    sun_protection: [
      'Reapply sunscreen every 2 hours in direct sun',
      'Seek shade during peak UV hours',
      ...extras.slice(1),
    ],
    hand_care: [
      'Reapply hand cream after every hand-washing — frequent washing strips natural oils faster than facial skin loses them',
      'The backs of the hands get regular sun exposure but are often skipped when applying sunscreen — include them daily',
      'Use a thicker, barrier-repairing cream (look for ceramides or shea butter) rather than a lightweight facial lotion',
      'Gentle exfoliation once or twice a week helps with rough or flaky patches on the hands',
    ],
    notes: [
      "This tool estimates visible color only — it does not screen for skin conditions. If you notice a new, changing, or unusual spot anywhere on your skin, it's worth mentioning to a doctor or dermatologist.",
    ],
  }
}

export const FAQ_ITEMS = [
  {
    q: 'Is this a medical diagnosis tool?',
    a: 'No. This tool gives an educational estimate of visible skin tone from a photo. It does not diagnose skin conditions and is not a substitute for professional dermatological advice.',
  },
  {
    q: 'Does skin tone determine skin type?',
    a: 'No. Skin tone (how light or dark skin appears) and skin type (oily, dry, combination, sensitive) are different things. This tool only classifies visible tone; skin type should be assessed separately.',
  },
  {
    q: 'Why does lighting affect my result?',
    a: 'Camera sensors and ambient light change how skin color is captured. The system applies lighting normalization, but results can still shift between very dark, overexposed, or strongly color-tinted photos.',
  },
  {
    q: 'Do darker skin tones need sunscreen?',
    a: 'Yes. All skin tones can be affected by UV exposure, so broad-spectrum sun protection is recommended across every class in this tool.',
  },
  {
    q: 'Is my photo stored?',
    a: 'By default, uploaded images are processed for analysis and are not permanently stored. See the Privacy note on the Analyze page for details.',
  },
  {
    q: 'What if no face is detected?',
    a: 'You will see a message asking for a clearer, front-facing photo with even lighting. The system will not crash or return a guess without a detected face.',
  },
]
