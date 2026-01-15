import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TransposeService {

  private static readonly NOTES_SHARP =
    ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  private static readonly NOTES_FLAT =
    ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  // ✅ REGEX CORREGIDO
  private static readonly CHORDS_REGEX_GLOBAL =
    /(?<=\s|^)([CDEFGAB](?:#|b)?(?:maj|min|m|sus|dim|aug|add)?[0-9]?(?:\/[CDEFGAB](?:#|b)?)?)(?=\s|$)/g;

  transposeChord(chord: string, semitones: number): string {
    const noteMatch = chord.match(/^([CDEFGAB](?:#|b)?)(.*)$/);
    if (!noteMatch) return chord;

    let baseNote = noteMatch[1];
    const suffix = noteMatch[2];

    baseNote = this.convertToSharp(baseNote);

    const index = TransposeService.NOTES_SHARP.indexOf(baseNote);
    if (index === -1) return chord;

    const newIndex =
      (index + semitones + 12) % 12;

    return TransposeService.NOTES_SHARP[newIndex] + suffix;
  }

  transposeText(text: string, semitones: number): string {
    if (!text) return '';

    return text.replace(
      TransposeService.CHORDS_REGEX_GLOBAL,
      chord => this.transposeChord(chord, semitones)
    );
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
