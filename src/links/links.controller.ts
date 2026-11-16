import { Body, Controller, Delete, Get, HttpCode, Param, Post, Redirect } from '@nestjs/common';
import { CreateLinkDto } from './create-link.dto';
import { LinksService } from './links.service';

@Controller()
export class LinksController {
  constructor(private readonly links: LinksService) {}

  @Post('links')
  create(@Body() dto: CreateLinkDto) {
    return this.links.create(dto.url, dto.alias);
  }

  @Get('links')
  list() {
    return this.links.list();
  }

  @Get('stats')
  stats() {
    return this.links.stats();
  }

  @Get('links/:code')
  detail(@Param('code') code: string) {
    return this.links.get(code);
  }

  @Delete('links/:code')
  @HttpCode(204)
  remove(@Param('code') code: string) {
    this.links.remove(code);
  }

  @Get(':code')
  @Redirect()
  go(@Param('code') code: string) {
    return { url: this.links.visit(code), statusCode: 302 };
  }
}
