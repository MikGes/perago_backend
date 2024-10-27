import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PositionService } from './position.service';

@Controller('position')
export class PositionController {
    constructor(private readonly positionService: PositionService) { }
    @Get('get-position-info/:id')
    async getPosition(@Param("id") id: any) {
        return await this.positionService.getPosition(id)
    }
    @Get('get-parents')
    async getParents() {
        return await this.positionService.getParents()
    }
    @Get('hierarchy')
    async getHierarchy() {
        return await this.positionService.getPositionHierarchy();
    }
    @Post('createpos')
    async create(@Body() createPositionDto: any) {
        return this.positionService.createPosition(createPositionDto);
    }
    @Patch('update-position/:id')
    async updatePosition(@Body() positionBody: any, @Param("id") id: any) {
        return this.positionService.updatePosition(positionBody, id)
    }
    @Delete("delete-position/:id")
    async deletePosition(@Param("id") id: any) {
        return this.positionService.deletePosition(id)
    }
    @Get('get-by-pagination')
    async getPaginatedPositions(
        @Query('page') page: number = 1,
        @Query('pageSize') pageSize: number = 10,
    ) {
        return this.positionService.getPaginatedPositions(page, pageSize);
    }
    @Get('parent-exist/:name')
    async getParentExist(@Param("name") name: string) {
        return this.positionService.getParentExist(name)
    }

}
