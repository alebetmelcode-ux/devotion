import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TransposeService {

  private static readonly NOTES_SHARP =
    ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  private static readonly NOTES_FLAT =
    ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  // ✅ SOLO ACORDES ENTRE [ ]
  private static readonly CHORDS_REGEX_GLOBAL =
    /\[([^\]]+)\]/g;

  transposeText(text: string, semitones: number): string {
    if (!text) return '';

    return text.replace(
      TransposeService.CHORDS_REGEX_GLOBAL,
      (_, chord) => `[${this.transposeChord(chord, semitones)}]`
    );
  }

  transposeChord(chord: string, semitones: number): string {
    const [main, bass] = chord.split('/');

    const match = main.match(/^([CDEFGAB](?:#|b)?)(.*)$/);
    if (!match) return chord;

    let [, root, suffix] = match;
    root = this.convertToSharp(root);

    const index = TransposeService.NOTES_SHARP.indexOf(root);
    if (index === -1) return chord;

    const newRoot =
      TransposeService.NOTES_SHARP[(index + semitones + 12) % 12];

    let result = newRoot + suffix;

    if (bass) {
      const bassSharp = this.convertToSharp(bass);
      const bassIndex = TransposeService.NOTES_SHARP.indexOf(bassSharp);
      if (bassIndex !== -1) {
        result += '/' +
          TransposeService.NOTES_SHARP[(bassIndex + semitones + 12) % 12];
      }
    }

    return result;
  }

  private convertToSharp(note: string): string {
    switch (note) {
      case 'Db': return 'C#';
      case 'Eb': return 'D#';
      case 'Gb': return 'F#';
      case 'Ab': return 'G#';
      case 'Bb': return 'A#';
      default: return note;
    }
  }
}
