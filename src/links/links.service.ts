import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { randomBytes } from 'crypto';

export interface Link {
  code: string;
  url: string;
  clicks: number;
  createdAt: string;
  lastClickAt: string | null;
}

const RESERVED = new Set(['links', 'stats']);

@Injectable()
export class LinksService {
  private readonly file = process.env.LINKS_FILE ?? join(process.cwd(), 'data', 'links.json');
  private links = new Map<string, Link>();

  constructor() {
    if (existsSync(this.file)) {
      const list: Link[] = JSON.parse(readFileSync(this.file, 'utf8'));
      list.forEach((l) => this.links.set(l.code, l));
    }
  }

  private save() {
    mkdirSync(dirname(this.file), { recursive: true });
    writeFileSync(this.file, JSON.stringify([...this.links.values()], null, 2));
  }

  private newCode(): string {
    let code: string;
    do {
      code = randomBytes(5).toString('base64url').slice(0, 6);
    } while (this.links.has(code) || RESERVED.has(code));
    return code;
  }

  create(url: string, alias?: string): Link {
    const code = alias ?? this.newCode();
    if (this.links.has(code) || RESERVED.has(code)) {
      throw new ConflictException(`El codigo "${code}" ya esta en uso`);
    }
    const link: Link = { code, url, clicks: 0, createdAt: new Date().toISOString(), lastClickAt: null };
    this.links.set(code, link);
    this.save();
    return link;
  }

  list(): Link[] {
    return [...this.links.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  get(code: string): Link {
    const link = this.links.get(code);
    if (!link) throw new NotFoundException(`No existe el codigo "${code}"`);
    return link;
  }

  /** Registra un click y devuelve la URL destino. */
  visit(code: string): string {
    const link = this.get(code);
    link.clicks += 1;
    link.lastClickAt = new Date().toISOString();
    this.save();
    return link.url;
  }

  remove(code: string): void {
    this.get(code);
    this.links.delete(code);
    this.save();
  }

  stats() {
    const all = this.list();
    const top = [...all].sort((a, b) => b.clicks - a.clicks).slice(0, 5);
    return {
      totalLinks: all.length,
      totalClicks: all.reduce((n, l) => n + l.clicks, 0),
      top: top.map(({ code, url, clicks }) => ({ code, url, clicks })),
    };
  }
}
