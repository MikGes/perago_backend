import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PositionService } from './position.service';
import { ApiParam, ApiQuery, ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Position')
@Controller('position')
export class PositionController {
    constructor(private readonly positionService: PositionService) { }

    @Get('get-position-info/:id')
    @ApiParam({
        name: 'id',
        description: 'Gets the Position ID',
        required: true,
        type: 'string',
    })
    async getPosition(@Param("id") id: string) {
        return await this.positionService.getPosition(id);
    }

    @Get('get-parents')
    async getParents() {
        return await this.positionService.getParents();
    }

    @Get('hierarchy')
    async getHierarchy() {
        return await this.positionService.getPositionHierarchy();
    }

    @Post('createpos')
    @ApiBody({
        description: 'Data for creating a new position',
        schema: {
            example: {
                name: 'Frontend Developer',
                description: 'Handles frontend tasks',
                parentId: '1234-abcd', // Example parent ID
            },
        },
    })
    async create(@Body() createPositionDto: any) {
        return this.positionService.createPosition(createPositionDto);
    }

    @Patch('update-position/:id')
    @ApiParam({
        name: 'id',
        description: 'ID of the position to update',
        required: true,
        type: 'string',
    })
    @ApiBody({
        description: 'Data to update the position',
        schema: {
            example: {
                name: 'Updated Position Name',
                description: 'Updated position description',
                parentId: '5678-efgh', // New parent ID if applicable
            },
        },
    })
    async updatePosition(@Body() positionBody: any, @Param("id") id: string) {
        return this.positionService.updatePosition(positionBody, id);
    }

    @Delete('delete-position/:id')
    @ApiParam({
        name: 'id',
        description: 'ID of the position to delete',
        required: true,
        type: 'string',
    })
    async deletePosition(@Param("id") id: string) {
        return this.positionService.deletePosition(id);
    }

    @Get('get-by-pagination')
    @ApiQuery({
        name: 'page',
        description: 'Page number for pagination',
        required: false,
        type: 'integer',
        example: 1,
    })
    @ApiQuery({
        name: 'pageSize',
        description: 'Number of items per page',
        required: false,
        type: 'integer',
        example: 10,
    })
    async getPaginatedPositions(
        @Query('page') page: number = 1,
        @Query('pageSize') pageSize: number = 10,
    ) {
        return this.positionService.getPaginatedPositions(page, pageSize);
    }

    @Get('parent-exist/:name')
    @ApiParam({
        name: 'name',
        description: 'Name of the parent position to check existence',
        required: true,
        type: 'string',
    })
    async getParentExist(@Param("name") name: string) {
        return this.positionService.getParentExist(name);
    }

    @Get('get-eligible-parents/:positionId')
    @ApiParam({
        name: 'positionId',
        description: 'ID of the position for which to get eligible parents',
        required: true,
        type: 'string',
    })
    async getEligibleParents(@Param("positionId") positionId: string) {
        return this.positionService.getEligibleParents(positionId);
    }
}
