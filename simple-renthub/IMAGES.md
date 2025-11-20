# 🖼️ Images in RentHub

## Generated Robot Parts Images

All the previously generated images are included in this project!

### Location
```
simple-renthub/public/images/generated_images/
```

### Available Images

1. **Cutting Tool Robot Part**
   - File: `Cutting_tool_robot_part_0711d221.png`
   - Size: 540 KB
   - Used for: Cutting equipment items

2. **IRB 1600 Robot Main Body**
   - File: `IRB_1600_robot_main_body_763c8594.png`
   - Size: 660 KB
   - Used for: Default fallback image

3. **Magnetic Gripper Robot Part**
   - File: `Magnetic_gripper_robot_part_33f8af0b.png`
   - Size: 970 KB
   - Used for: Gripper equipment items

4. **Vacuum Gripper Robot Part**
   - File: `Vacuum_gripper_robot_part_6c59963c.png`
   - Size: 935 KB
   - Used for: Vacuum gripper items

5. **Welding Torch Robot Part**
   - File: `Welding_torch_robot_part_8d09dbdf.png`
   - Size: 728 KB
   - Used for: Welding equipment items

## How Images Are Used

### In HTML
```html
<img src="/images/generated_images/Welding_torch_robot_part_8d09dbdf.png" alt="Welding torch">
```

### In JavaScript
```javascript
const item = {
  imageUrl: '/images/generated_images/Cutting_tool_robot_part_0711d221.png'
};
```

### In server.js
```javascript
imageUrl: '/images/generated_images/IRB_1600_robot_main_body_763c8594.png'
```

## Adding Your Own Images

1. Place images in: `simple-renthub/public/images/`
2. Reference them with: `/images/your-image.png`
3. Update items in `server.js` to use new images

## Image Loading

The server automatically serves all files in the `public/` folder:

```javascript
app.use(express.static('public'));
```

This means any file in `public/images/` is accessible at `/images/filename.png`

## Fallback Image

If an image fails to load, the default fallback is used:

```javascript
onerror="this.src='/images/generated_images/IRB_1600_robot_main_body_763c8594.png'"
```

---

All images are included and ready to use! 🎨
