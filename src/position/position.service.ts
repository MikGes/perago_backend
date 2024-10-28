import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PositionService {
    constructor(private prisma: PrismaService) { }
    async getPaginatedPositions(page: number = 1, pageSize: number = 10) {
        try {
            const skip = (page - 1) * pageSize;
            const [positions, total] = await this.prisma.$transaction([
                this.prisma.position.findMany({
                    skip,
                    take: Number(pageSize),
                    orderBy: { name: 'asc' },
                    include: {
                        parent: { // Include the parent position
                            select: {
                                name: true, // Select only the parent's name
                            },
                        },
                    },
                }),
                this.prisma.position.count(),
            ]);

            return {
                positions: positions.map(position => ({
                    ...position,
                    parentPosition: position.parent ? position.parent.name : 'N/A', // Display parent name or 'N/A' if no parent
                })),
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            };
        } catch (error) {
            return { message: "Error in fetching data" }
        }
    }

    async createPosition(data: any) {
        try {
            let { name, description, parentId } = data;
            name = name.toUpperCase()
            const position_already_exist = await this.prisma.position.findFirst({
                where: {
                    name
                }
            })
            if (position_already_exist) return "Position Already Exist"
            await this.prisma.position.create({
                data: {
                    name,
                    description,
                    parent: parentId ? { connect: { id: parentId } } : undefined, // Connect to parent if parentId exists
                },
                include: { children: true }, // Optionally, include children for verification
            });
            return true
        } catch (error) {
            return "Unable to handle your request"
        }
    }
    async getPositionHierarchy(positionId: string | null = null) {

        try {
            // Find all positions with the given `parentId`
            const positions = await this.prisma.position.findMany({
                where: { parentId: positionId },
            });

            // Recursively fetch children for each position
            const positionsWithChildren = await Promise.all(
                positions.map(async (position) => ({
                    ...position,
                    children: await this.getPositionHierarchy(position.id), // Recursive call
                })),
            );

            return positionsWithChildren;
        } catch (error) {
            return undefined
        }
    }
    async getParents() {
        try {
            const parents = await this.prisma.position.findMany({
                select: {
                    id: true,
                    name: true,
                    parent: {
                        select: {
                            name: true
                        }
                    }
                }

            })
            return parents
        } catch (error) {
            return undefined
        }
    }
    async getPosition(id: any) {
        const targetPosition = await this.prisma.position.findUnique({
            where: {
                id,
            }
        })
        if (targetPosition) {
            return targetPosition
        }
        else {
            return undefined
        }
    }
    async updatePosition(positionBody: any, id: any) {
        if (id && positionBody) {
            const { name, description, parentId } = await positionBody
            console.log(name, description)
            try {
                await this.prisma.position.update({
                    where: {
                        id,
                    },
                    data: {
                        name,
                        description,
                        ...(parentId ? { parentId } : {}),  // include parentId only if it's truthy (non-empty)
                    },
                });
                console.log("hello")
                return { done: true, message: "Position Updated Successfully" }
            } catch (error) {
                return { done: false, message: "Can't update position" }
            }
        }
        else {
            return { done: false, message: "Can't update position" }
        }
    }
    async deletePosition(id: any) {
        console.log(id)
        try {
            const targetPosition = await this.prisma.position.findFirst({
                where: {
                    id,
                },
                include: {
                    children: true, // Include children to check if any exist
                },
            });

            if (targetPosition) {
                if (targetPosition.children.length > 0) {
                    return { done: false, message: "Can't delete this position because it has child positions." };
                }

                // If no children, proceed with deletion
                await this.prisma.position.delete({
                    where: {
                        id,
                    },
                });

                return { done: true, message: "Position deleted successfully." };
            } else {
                return { done: false, message: "Position not found." };
            }
        } catch (error) {
            console.error("Error deleting position:", error);
            return { done: false, message: "Unable to handle your request" };
        }
    }
    async getParentExist(name: string) {
        try {
            name = name.toUpperCase()
            const parent = await this.prisma.position.findFirst({ where: { name } })
            if (!parent) return { found: false }
            else return { message: "Parent already exist", found: true }
        } catch (error) {
            return { message: "Can't update position", found: true }
        }
    }
    async getEligibleParents(positionId: string) {
        // Get the list of descendants of the position being edited
        const descendants = await this.getDescendants(positionId);

        // Fetch positions excluding the current position and its descendants
        const eligibleParents = await this.prisma.position.findMany({
            where: {
                NOT: {
                    id: {
                        in: descendants.map(pos => pos.id).concat(positionId),
                    },
                },
            },
            select: {
                id: true,
                name: true,
            },
        });

        return eligibleParents;
    }

    // Recursive function to get all descendants of a position
    async getDescendants(positionId: string, descendants: any[] = []): Promise<any[]> {
        const children = await this.prisma.position.findMany({
            where: {
                parentId: positionId,
            },
        });

        for (const child of children) {
            descendants.push(child);
            await this.getDescendants(child.id, descendants);
        }

        return descendants;
    }

}
