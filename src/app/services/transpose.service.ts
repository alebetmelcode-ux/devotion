import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TransposeService {

  // private static readonly NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  // private static readonly CHORDS_REGEX = /(?:[CDEFGAB](?:#|b)?(?:maj|min|m|sus|dim|aug|add)?[0-9]?(?:\/[CDEFGAB](?:#|b)?)?)/g;

  // For simplicity and to match the common chord notation used in music sheets.
  // Including both sharps and flats for better flexibility in input, but internally converting to sharps.
  private static readonly NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  private static readonly NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];


  // Regex to find chords. This regex tries to be comprehensive but simple enough.
  // It looks for:
  // - A base note (C, D, E, F, G, A, B)
  // - Optional accidental (# or b)
  // - Optional chord quality (maj, min, m, sus, dim, aug, add, etc. - simplified to just look for common patterns)
  // - Optional number (e.g., 7, 9)
  // - Optional bass note (e.g., /G)
  private static readonly CHORDS_REGEX_GLOBAL = /(?<=\s|^)([CDEFGAB](?:#|b|maj|min|m|sus|dim|aug|add)?[0-9]?(?:\/[CDEFGAB](?:#|b)?)?)(?=\s|$)/g;


  constructor() { }

  /**
   * Transposes a single chord by a given number of semitones.
   * @param chord The chord string (e.g., "Am7", "G#", "Db/F").
   * @param semitones The number of semitones to transpose. Positive for up, negative for down.
   * @returns The transposed chord string.
   */
  transposeChord(chord: string, semitones: number): string {
    // Extract the base note and accidental (e.g., "C", "C#", "Db")
    const noteMatch = chord.match(/([CDEFGAB](?:#|b)?)/);
    if (!noteMatch) {
      return chord; // No base note found, return original chord
    }

    let baseNote = noteMatch[1];
    const chordSuffix = chord.substring(baseNote.length); // e.g., "m7", "/F"

    // Convert flat notes to their sharp equivalent for consistent indexing
    baseNote = this.convertToSharp(baseNote);

    const currentIndex = TransposeService.NOTES_SHARP.indexOf(baseNote);
    if (currentIndex === -1) {
      return chord; // Should not happen if convertToSharp is comprehensive
    }

    const newIndex = (currentIndex + semitones % 12 + 12) % 12; // Ensure positive index
    const newBaseNote = TransposeService.NOTES_SHARP[newIndex];

    return newBaseNote + chordSuffix;
  }

  /**
   * Transposes all chords found within a given text (lyrics/chords block).
   * @param text The input text containing chords.
   * @param semitones The number of semitones to transpose.
   * @returns The text with all chords transposed.
   */
  transposeText(text: string, semitones: number): string {
    if (!text) {
      return '';
    }
    // Use a replacer function with the global regex to transpose all occurrences
    return text.replace(TransposeService.CHORDS_REGEX_GLOBAL, (match) => {
      return this.transposeChord(match, semitones);
    });
  }

  /**
   * Converts a flat note to its sharp equivalent.
   * @param note The note string (e.g., "Db", "Eb").
   * @returns The sharp equivalent (e.g., "C#", "D#") or the original note if not a flat.
   */
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

  /**
   * Calculates the semitone difference between two notes.
   * @param fromNote The starting note (e.g., "C").
   * @param toNote The target note (e.g., "D").
   * @returns The semitone difference.
   */
  getSemitoneDifference(fromNote: string, toNote: string): number {
    const fromIndex = TransposeService.NOTES_SHARP.indexOf(this.convertToSharp(fromNote));
    const toIndex = TransposeService.NOTES_SHARP.indexOf(this.convertToSharp(toNote));

    if (fromIndex === -1 || toIndex === -1) {
      console.warn(`Could not find one of the notes: ${fromNote}, ${toNote}`);
      return 0;
    }

    let diff = toIndex - fromIndex;
    // Adjust for wrapping around the octave
    if (diff > 6) { // If going up more than a tritone, it's probably shorter to go down
      diff -= 12;
    } else if (diff < -6) { // If going down more than a tritone, it's probably shorter to go up
      diff += 12;
    }
    return diff;
  }
}
