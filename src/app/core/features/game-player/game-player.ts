private touchStartX = 0;
  private touchStartY = 0;

  onCanvasTouchStart(event: TouchEvent): void {
    if (event.touches.length > 0) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    }
  }

  onCanvasTouchEnd(event: TouchEvent): void {
    if (event.changedTouches.length === 0) return;
    const dx = event.changedTouches[0].clientX - this.touchStartX;
    const dy = event.changedTouches[0].clientY - this.touchStartY;

    if (Math.abs(dx) < 16 && Math.abs(dy) < 16) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.setDirection(dx > 0 ? 1 : -1, 0);
    } else {
      this.setDirection(0, dy > 0 ? 1 : -1);
    }
  }
