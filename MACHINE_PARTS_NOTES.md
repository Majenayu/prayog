# Machine Parts Drag-and-Drop Feature - Implementation Notes

## Overview
The interactive machine parts diagram feature allows:
- **Users**: View visual diagrams of machine parts positioned around a central machine image
- **Industries**: Add parts and drag-and-drop to position them visually on the diagram

## Current Implementation

### Features Implemented
✅ Interactive parts diagram viewer for users (MachineDiagramViewer component)
✅ Drag-and-drop interface for industries to position parts
✅ Percentage-based positioning system (0-100 coordinates)
✅ Optimistic UI updates with proper rollback on errors
✅ Strict input validation using Zod
✅ Industry-only authorization for creating and updating parts

### Security & Validation
- ✅ **Authentication**: All endpoints require authenticated session
- ✅ **Authorization**: Only users with `role === "industry"` can create/update parts
- ✅ **Input Validation**: 
  - Zod schemas validate all inputs
  - Position coordinates coerced to integers 0-100
  - Null/undefined values explicitly rejected
- ✅ **Optimistic Updates**: Client snapshots previous state and restores on error

### Known Limitations

#### 1. No Ownership Tracking
**Issue**: Machine parts are currently global to machine types. Any industry can position any part for any machine type.

**Why**: The `machine_parts` table doesn't have an `industryId` foreign key to track which industry created each part.

**Impact**: 
- Any authenticated industry user can update positions of parts created by other industries
- Parts are shared across all industries for each machine type

**To Fix** (requires schema migration):
1. Add `industryId` column to `machine_parts` table
2. Update `createMachinePart` to store the creating industry's ID
3. Add ownership check in PATCH endpoint:
   ```typescript
   if (part.industryId !== req.session.userId) {
     return res.status(403).json({ message: "You can only update your own parts" });
   }
   ```

#### 2. Parts Are Global, Not Item-Specific
**Issue**: Parts are associated with machine types (e.g., "CNC Machine") rather than specific rental items.

**Current Behavior**: When an industry adds a part to "CNC Machine", it appears for all CNC machines across all industries.

**Production Recommendation**: Link parts to specific item IDs so each industry's equipment has its own unique parts diagram.

## API Endpoints

### GET /api/machine-parts/types
Returns list of all machine types that have parts.

### GET /api/machine-parts/:machineType
Returns all parts for a specific machine type.

### POST /api/machine-parts
Creates a new machine part.
- **Auth**: Industry only (403 for non-industries)
- **Validates**: Part data + optional position/diagram fields

### PATCH /api/machine-parts/:id/position
Updates the position coordinates of a part.
- **Auth**: Industry only (403 for non-industries)
- **Validates**: positionX and positionY (integers 0-100, both required)
- **Note**: Does not verify ownership - any industry can update any part

## File Structure

```
client/src/
├── components/
│   └── machine-diagram-viewer.tsx  # Visual diagram viewer for users
└── pages/
    └── manage-machine-parts.tsx     # Drag-and-drop interface for industries

server/
├── routes.ts                        # API endpoints for machine parts
└── storage.ts                       # Database operations

shared/
└── schema.ts                        # Drizzle schema with positionX, positionY, diagramImageUrl
```

## Testing

### Manual Testing Steps

1. **As Industry User**:
   - Login as `acme_industrial` / `industry123`
   - Click "Machine Parts" button in header
   - Select "CNC Machine" from dropdown
   - Click "Add Part" to create a new part
   - Drag parts from unpositioned list onto diagram
   - Verify parts appear at correct positions

2. **As Regular User**:
   - Login as `john_builder` / `user123`
   - Click diagram icon in dashboard header
   - Select "CNC Machine" to view positioned parts
   - Verify parts display correctly with tooltips

### Security Testing
- Try to access /industry/machine-parts as regular user (should redirect)
- Try to call PATCH /api/machine-parts/:id/position as regular user (should 403)

## Future Enhancements

1. **Add Ownership Tracking**: See "Known Limitations" section above
2. **Link Parts to Specific Items**: Associate parts with individual rental items instead of machine types
3. **Part Categories**: Group parts by system (electrical, mechanical, hydraulic)
4. **Bulk Operations**: Select and move multiple parts at once
5. **Snap-to-Grid**: Optional grid overlay for precise positioning
6. **Zoom & Pan**: For complex machines with many parts
7. **Part Search**: Filter parts by name or category
8. **Version History**: Track position changes over time
