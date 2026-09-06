import { NextResponse } from 'next/server';
import { connect, serializeApplicant } from '@/lib/db';
import { getAdminSession } from '@/lib/authorize';

export async function PATCH(req, { params }) {
    try {
        const { status } = await getAdminSession();
        if (status === 'unauthenticated') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        if (status === 'forbidden') {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        if (typeof body.shortlisted !== 'boolean') {
            return NextResponse.json({ success: false, message: 'Invalid request: shortlisted must be a boolean' }, { status: 400 });
        }

        const { id } = params;
        const db = await connect();
        const docRef = db.collection('formData').doc(id);

        const snapshot = await docRef.get();
        if (!snapshot.exists) {
            return NextResponse.json({ success: false, message: 'Applicant not found' }, { status: 404 });
        }

        await docRef.update({ shortlisted: body.shortlisted });
        const updatedSnapshot = await docRef.get();

        const applicant = serializeApplicant(updatedSnapshot);

        return NextResponse.json({ success: true, data: applicant });
    } catch (error) {
        console.error('Error updating applicant:', error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

