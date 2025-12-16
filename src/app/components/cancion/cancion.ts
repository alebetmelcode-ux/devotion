import { Component, signal, inject, effect, Output, EventEmitter, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SongService } from '../../services/song.service';
import { TransposeService } from '../../services/transpose.service';
import { Song, ParsedLine } from '../../models/song.model';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-cancion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './cancion.html',
  styleUrl: './cancion.css',
})
export class Cancion implements OnInit, AfterViewInit {
  songService = inject(SongService);
  transposeService = inject(TransposeService);
  fb = inject(FormBuilder);
  router = inject(Router);

  songForm!: FormGroup;
  
  @Output() songSaved = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  songToEdit = this.songService.songToEdit;
  selectedChord = signal<string | null>(null); // Nueva señal para el acorde seleccionado
  

  highlightedLyrics = '';
  private lyricsBackdrop: HTMLElement | null = null;

  constructor(private elRef: ElementRef) {
    effect(() => {
      const song = this.songToEdit();
      if (song) {
        this.populateForm(song);
      } else {
        this.resetForm();
      }
    });
  }

  ngOnInit(): void {
    this.songForm = this.fb.group({
      id: [null],
      titulo: ['', Validators.required],
      'tono-original': ['C', Validators.required],
      'id-categoria': [''],
      lyricsWithChords: ['', Validators.required]
    });

    this.songForm.get('lyricsWithChords')?.valueChanges.subscribe(value => {
      this.updateHighlight(value);
    });
  }

  ngAfterViewInit(): void {
    // Attach event listener after view initialization
    this.lyricsBackdrop = (this.elRef.nativeElement as HTMLElement).querySelector('.lyrics-backdrop');
    if (this.lyricsBackdrop) {
      this.lyricsBackdrop.addEventListener('click', this.handleChordClick.bind(this));
    }
  }

  private handleChordClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target && target.classList.contains('chord-highlight')) {
      const chord = target.getAttribute('data-chord');
      if (chord) {
        this.onChordClick(chord);
      }
    }
  }

  updateHighlight(text: string): void {
    if (typeof text !== 'string') {
      this.highlightedLyrics = '';
      return;
    };
    // This regex is a bit more specific to avoid matching random capital letters.
    // It looks for a chord structure, potentially with slashes for bass notes.
    const chordRegex = /(?<=\s|^|\(|\[)([A-G](?:b|#)?(?:m|maj|min|dim|aug|sus|add)?[0-9]*(?:\/[A-G](?:b|#)?)?)(?=\s|$|\)|\-|\])/g;
    const highlighted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(chordRegex, `<span class="chord-highlight" data-chord="$1">$&</span>`) // Modified to use data-chord
      .replace(/<br\/>$/, ''); // Remove the extra br if it exists at the end
    this.highlightedLyrics = highlighted;
  }

  onChordClick(chord: string): void {
    this.selectedChord.set(chord);
    console.log('Acorde seleccionado:', chord);
  }

  
  syncScroll(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    if (!this.lyricsBackdrop) {
      this.lyricsBackdrop = (this.elRef.nativeElement as HTMLElement).querySelector('.lyrics-backdrop');
    }
    if (this.lyricsBackdrop) {
      this.lyricsBackdrop.scrollTop = textarea.scrollTop;
      this.lyricsBackdrop.scrollLeft = textarea.scrollLeft;
    }
  }

  transposeDown(): void {
    const currentKey = this.songForm.get('tono-original')?.value || 'C';
    const semitones = -1;
    const lyrics = this.songForm.get('lyricsWithChords')?.value;

    this.songForm.patchValue({
      'lyricsWithChords': this.transposeService.transposeText(lyrics, semitones),
      'tono-original': this.transposeService.transposeChord(currentKey, semitones)
    });
  }

  transposeUp(): void {
    const currentKey = this.songForm.get('tono-original')?.value || 'C';
    const semitones = 1;
    const lyrics = this.songForm.get('lyricsWithChords')?.value;
    
    this.songForm.patchValue({
      'lyricsWithChords': this.transposeService.transposeText(lyrics, semitones),
      'tono-original': this.transposeService.transposeChord(currentKey, semitones)
    });
  }


  populateForm(song: Song): void {
    this.songForm.patchValue({
      id: song.id,
      titulo: song.titulo,
      'tono-original': song['tono-original'],
      'id-categoria': song['id-categoria'] || '',
      lyricsWithChords: this.combineLyricsAndChords(song.letra, song.acordes)
    });
  }

  saveSong(): void {
    if (this.songForm.valid) {
      const formValue = this.songForm.value;
      const { letra, acordes } = this.splitLyricsAndChords(formValue.lyricsWithChords);
      
      const songToSave: Song = {
        id: formValue.id || 0,
        titulo: formValue.titulo,
        'tono-original': formValue['tono-original'],
        'id-categoria': formValue['id-categoria'],
        letra: letra,
        acordes: acordes
      };

      if (songToSave.id) {
        this.songService.updateSong(songToSave.id, songToSave);
      } else {
        this.songService.addSong(songToSave);
      }
      
      this.songService.clearEditing();
      this.songSaved.emit();
    }
  }

  onCancel(): void {
    this.songService.clearEditing();
    this.cancel.emit();
  }

  addToDevocional(): void {
    if (this.songForm.valid) {
      const formValue = this.songForm.value;
      const songId = formValue.id;
      const { acordes } = this.splitLyricsAndChords(formValue.lyricsWithChords);

      if (songId) {
        this.router.navigate(['/devocionales/seleccionar-cancion', songId, { 'acordes-finales': acordes }]);
      } else {
        alert('Por favor, guarda la canción primero antes de añadirla a un devocional.');
      }
    } else {
      alert('Por favor, completa el formulario de la canción correctamente.');
    }
  }

  resetForm(): void {
    if (this.songForm) {
      this.songForm.reset({
        id: null,
        titulo: '',
        'tono-original': 'C',
        'id-categoria': '',
        lyricsWithChords: ''
      });
    }
  }

  splitLyricsAndChords(text: string): { letra: string; acordes: string } {
    if (!text) return { letra: '', acordes: '' };

    const lines = text.split('\n');
    const lyricLines: string[] = [];
    const chordLines: string[] = [];

    // The original chord regex from the component, used for identification
    const chordRegex = /(?<=\s|^|\(|\[)([A-G](?:b|#)?(?:m|maj|min|dim|aug|sus|add)?[0-9]*(?:\/[A-G](?:b|#)?)?)(?=\s|$|\)|\-|\])/g;

    const isChordLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return false;
        // Permissive heuristic: if less than 20% of the line is non-chord, non-space characters, treat it as a chord line.
        const nonChordChars = trimmed.replace(chordRegex, '').replace(/\s+/g, '');
        return nonChordChars.length / trimmed.length < 0.2;
    };

    for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i];
        const nextLine = lines[i + 1];

        if (isChordLine(currentLine)) {
            chordLines.push(currentLine);
            // If the next line is not a chord line (i.e., a lyric line), we associate the current chord line with it.
            // If there's no next line or the next line is also a chord line, we associate it with an empty lyric line.
            if (nextLine !== undefined && !isChordLine(nextLine)) {
                lyricLines.push(nextLine);
                i++; // Skip the next line as it's been consumed as a lyric line
            } else {
                lyricLines.push(''); // No lyric line directly associated, push an empty one for alignment
            }
        } else {
            // If it's a lyric line, add it to lyricLines.
            // If no corresponding chord line has been added yet for this lyric line index, add an empty one.
            if (chordLines.length <= lyricLines.length) { // <= to account for initial state or consecutive lyric lines
                chordLines.push('');
            }
            lyricLines.push(currentLine);
        }
    }
    
    // Ensure both arrays have the same length by padding the shorter one with empty strings
    while (chordLines.length < lyricLines.length) {
        chordLines.push('');
    }
    while (lyricLines.length < chordLines.length) {
        lyricLines.push('');
    }

    // Filter out empty lines that were just for alignment if they appear at the end
    // Or just join them directly and let the consumer handle empty lines.
    return { letra: lyricLines.join('\n'), acordes: chordLines.join('\n') };
  }

  
  combineLyricsAndChords(letra: string, acordes: string): string {
    const lyricLines = letra.split('\n');
    const chordLines = acordes.split('\n');
    const combinedLines: string[] = [];
    const maxLength = Math.max(lyricLines.length, chordLines.length);

    for (let i = 0; i < maxLength; i++) {
      const currentChordLine = chordLines[i] !== undefined ? chordLines[i] : '';
      const currentLyricLine = lyricLines[i] !== undefined ? lyricLines[i] : '';

      // Add chord line if it exists
      if (currentChordLine.trim() !== '') {
        combinedLines.push(currentChordLine);
      }
      // Always add lyric line (even if empty to maintain spacing)
      combinedLines.push(currentLyricLine);
    }
    return combinedLines.join('\n');
  }
}
