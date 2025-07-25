// app/api/equipments/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            brand,
            model,
            type,
            expirationDate,
            status,
            remarks,
            owner,
            image_url,
            inspectionDate,
            projectId,
        } = body;

        // Validate required fields
        if (!brand || !model || !type || !expirationDate || !owner || !projectId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify that the project exists
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Create the equipment
        const equipment = await prisma.equipment.create({
            data: {
                brand,
                model,
                type,
                status: status || 'OPERATIONAL',
                remarks,
                owner,
                image_url,
                inspection_date: inspectionDate ? new Date(inspectionDate) : null,
                project_id: projectId,
            },
            include: {
                project: {
                    include: {
                        client: {
                            include: {
                                location: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(equipment, { status: 201 });
    } catch (error) {
        console.error('Error creating equipment:', error);
        return NextResponse.json(
            { error: 'Failed to create equipment' },
            { status: 500 }
        );
    }
}