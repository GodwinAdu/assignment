import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/jwt';
import { AuditLog } from '@/models/AuditLog';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const employees = await User.find({ role: 'employee' }).select(
      'firstName lastName email department designation isActive createdAt phone'
    );

    return NextResponse.json({
      employees: employees.map((emp) => ({
        id: emp._id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        department: emp.department,
        designation: emp.designation,
        phone: emp.phone,
        status: emp.isActive ? 'active' : 'inactive',
        joinDate: emp.createdAt.toISOString().split('T')[0],
      })),
    });
  } catch (error) {
    console.error('[v0] Get employees error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update employee details
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { employeeId, ...updateFields } = body;

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    // Whitelist allowed updates
    const allowed: Record<string, any> = {};
    if (updateFields.firstName) allowed.firstName = updateFields.firstName;
    if (updateFields.lastName) allowed.lastName = updateFields.lastName;
    if (updateFields.department !== undefined) allowed.department = updateFields.department;
    if (updateFields.designation !== undefined) allowed.designation = updateFields.designation;
    if (updateFields.phone !== undefined) allowed.phone = updateFields.phone;
    if (updateFields.isActive !== undefined) allowed.isActive = Boolean(updateFields.isActive);

    const employee = await User.findByIdAndUpdate(
      employeeId,
      { $set: allowed },
      { new: true }
    ).select('-password');

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    await AuditLog.create({
      userId: payload.userId,
      action: `Updated employee: ${employee.firstName} ${employee.lastName}`,
      actionType: 'update',
      resourceType: 'Employee',
      resourceId: employeeId,
      changes: Object.entries(allowed).map(([field, newValue]) => ({ field, oldValue: null, newValue })),
      status: 'success',
    });

    return NextResponse.json({ message: 'Employee updated', employee });
  } catch (error) {
    console.error('[v0] Update employee error:', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}

// DELETE: Deactivate employee (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('id');

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Toggle active status (soft delete)
    employee.isActive = !employee.isActive;
    await employee.save();

    await AuditLog.create({
      userId: payload.userId,
      action: `${employee.isActive ? 'Activated' : 'Deactivated'} employee: ${employee.firstName} ${employee.lastName}`,
      actionType: 'update',
      resourceType: 'Employee',
      resourceId: employeeId,
      changes: [{ field: 'isActive', oldValue: !employee.isActive, newValue: employee.isActive }],
      status: 'success',
    });

    return NextResponse.json({
      message: `Employee ${employee.isActive ? 'activated' : 'deactivated'}`,
      isActive: employee.isActive,
    });
  } catch (error) {
    console.error('[v0] Delete employee error:', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}
