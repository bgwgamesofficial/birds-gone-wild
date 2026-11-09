// The frame loop: physics, spawning, camera, effects and rendering every frame.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

let uiLast = '',
  last = performance.now(),
  nextFrame = 0,
  fpsAcc = 0,
  fpsN = 0,
  adaptK = 1,
  hz = 60,
  hzS = [],
  hzN = 0,
  hzLast = 0;
function loop(now) {
  requestAnimationFrame(loop);
  if (hzN < 90) {
    if (hzLast) hzS.push(now - hzLast);
    hzLast = now;
    if (++hzN === 90) {
      hzS.sort((a, b) => a - b);
      const rhz = 1000 / hzS[hzS.length >> 1];
      hz = [30, 60, 75, 90, 100, 120, 144, 165, 240, 360].reduce((a, b) =>
        Math.abs(b - rhz) < Math.abs(a - rhz) ? b : a,
      );
    }
  }
  const fmS = 1000 / capFps();
  if (hzN >= 90 && now < nextFrame - Math.min(2, fmS * 0.25)) return;
  nextFrame = Math.max(nextFrame + fmS, now - fmS);
  const raw = now - last;
  const dt = paused ? 0 : Math.min(raw / 1000, 0.05);
  last = now;
  time += dt;
  dtg = dt;
  if (raw < 200) {
    fpsAcc += raw;
    if (++fpsN >= 90) {
      const avg = fpsAcc / fpsN;
      fpsAcc = 0;
      fpsN = 0;
      if (S.adaptive && hzN >= 90 && avg > (1000 / Math.min(capFps(), hz)) * 1.3 && adaptK > 0.5) {
        adaptK = Math.max(0.5, adaptK - 0.12);
        applyRes();
      }
    }
  }

  if (state === 'ready') {
    y = 1 + Math.sin(now / 300) * 0.5;
  }
  if (cdEnd) cdTick(now);
  if (now - fitT > 250) {
    fitT = now;
    fitMenus();
  }
  if (state === 'play') {
    vy += GRAV * (fxOn('feather') ? 0.7 : 1) * (1 - 0.07 * perks.wings) * dt;
    if (vy < -13) vy = -13;
    y += vy * dt;
    gt += dt;
    RS += sp() * dt;
    incT += dt;
    AI.y += (y - AI.y) * (1 - Math.exp(-0.7 * dt));
    {
      const bi = Math.max(0, Math.min(9, Math.floor(((y - BOT) / (CEIL - BOT)) * 10)));
      for (let i = 0; i < 10; i++) HAB[i] *= Math.exp(-0.15 * dt);
      HAB[bi] += dt;
    }
    while (incT >= 2) {
      incT -= 2;
      {
        const inc = 0.25 * MM();
        wallet += inc;
        run += inc;
      }
      saveW();
    }
    pipes.forEach((p) => {
      p.g.position.z += sp() * dt;
      p.z = p.g.position.z;
      updPipe(p);
      if (Math.abs(p.z) < PIPE_W / 2 + HB()) {
        if (y > p.gy + GAP / 2 - HB() || y < p.gy - GAP / 2 + HB()) die();
      }
      if (!p.scored && p.z > PIPE_W / 2 + 0.4) {
        p.scored = true;
        score++;
        hud.textContent = score;
        hud.classList.remove('bump');
        void hud.offsetWidth;
        hud.classList.add('bump');
        sfx.score();
        gainXp(2);
        AI.skill += (Math.max(0, 1 - Math.abs(y - p.gy) / 2.5) - AI.skill) * 0.25;
        if (Math.abs(y - p.gy) < 0.9) {
          popText('Perfect!', '#7fe7ff');
          gainXp(1);
          burst(0, y, 0.5, 18, 0x7fe7ff, 4.5, 0.7);
        }
      }
    });
    foes.forEach((f) => {
      f.z += (sp() + 4) * dt;
      aiHunt(f, dt);
      const fy = f.y + Math.sin(gt * (f.fq || 3) + f.ph) * (f.amp || 0.35);
      if (f.wantRet && !f.ret && !f.hit && f.tt === undefined && f.dir * f.x < -f.turnX) {
        if (hawksActive() < lvMaxActive()) f.tt = 0;
        else f.wantRet = false;
      } /* U-turn only if it keeps the 3-hawk rule */
      if (f.svT !== undefined) f.sv += (f.svT - f.sv) * (1 - Math.exp(-3 * dt));
      let vel = 1;
      if (f.tt !== undefined) {
        f.tt += dt;
        const TT = 1.1;
        vel = Math.cos(Math.PI * Math.min(1, f.tt / TT));
        f.y += Math.max(-3 * dt, Math.min(3 * dt, y - f.y));
        if (f.tt >= TT) {
          f.tt = undefined;
          f.dir = -f.dir;
          f.ret = true;
          f.warned = false;
          f.ty = undefined;
          vel = 1;
        }
      }
      f.x -=
        f.dir *
        FVX *
        HS() *
        (mode === 5 && BR ? lvSpd() : 1) *
        (f.kind === 'dash'
          ? Math.abs(f.x) > 9
            ? 0.55
            : 1.5
          : f.kind === 'boss'
            ? (f.bs || 1) * (lvProg >= lvNeed() * (f.cap ? 0.5 : 0.4) ? 1 + 0.15 * BOSS_K : 1)
            : 1) *
        (f.sv || 1) *
        vel *
        dt;
      /* boss: full speed, faster when enraged (second half) */ if (f.kind === 'boss' && f.dir * f.x < -11) {
        f.dir = -f.dir;
        f.hit = false;
        f.pc = false;
        f.sc = false;
        f.warned = false;
        f.reaimed = false;
        f.ty = undefined;
        f.y = Math.max(BOT + 3, Math.min(CEIL - 0.2, y + Math.random() * 4 - 2));
        if (!f.cap && hawksActive() < lvMaxActive()) {
          spawnFoe(-(sp() + 4) * 2.4, y, 0.6 + 0.5 * lvD());
          const e = foes[foes.length - 1];
          e.kind = 'hunter';
          e.dir = -f.dir;
          e.x = e.dir * Math.abs(e.x);
          e.y = Math.max(BOT + 3, Math.min(CEIL - 0.2, y + (Math.random() < 0.5 ? -2 : 2)));
          e.mind = 0.5;
          e.sv = 1;
          e.svT = 1;
        }
      }
      /* boss turns sooner and brings an escort from the other side */ f.g.position.set(f.x, fy, 0);
      {
        const ck = Math.max(0, Math.min(1, (fy - CLO - 0.5) / 4));
        f.gl.material.opacity = 0.9 * (1 - ck * 0.9);
      }
      f.g.rotation.y =
        ((-f.dir * Math.PI) / 2) * (f.tt !== undefined ? Math.cos(Math.PI * Math.min(1, f.tt / 1.1)) : 1);
      f.g.rotation.z = f.tt !== undefined ? Math.sin(Math.PI * Math.min(1, f.tt / 1.1)) * 0.6 * f.dir : 0;
      f.fy = fy;
      if (
        !f.hit &&
        Math.abs(f.x) < (f.kind === 'boss' ? (f.cap ? 1.1 : 1.4) : mode === 5 ? 0.8 : 0.9) &&
        Math.abs(y - fy) <
          (f.kind === 'boss'
            ? (f.cap ? 0.6 : 0.75) + 0.1 * (f.bd || 0)
            : mode === 5
              ? BR
                ? 0.3 + 0.1 * lvD()
                : 0.38
              : 0.45) +
            HB()
      )
        foeHit(f);
    });
    if (mode === 5 && !BR) {
      hawkT -= dt;
      if (!paused) {
        campT = y > CLO + 0.3 ? Math.min(4, campT + dt) : Math.max(0, campT - 2 * dt);
        if (campT > 1.2) {
          cloudT -= dt;
          if (cloudT <= 0 && hawksActive() < 3) {
            spawnCloudHawk();
            cloudT = (1.3 - 0.5 * Math.min(1, score / 40)) * (0.8 + 0.4 * Math.random());
          }
        } else cloudT = 0.4;
      }
      /* anti-camping, as in Boss Run */ if (hawkT <= 0) {
        const n =
            1 +
            (Math.random() < Math.min(0.6, 0.12 + score * 0.017) ? 1 : 0) +
            (score > 18 && Math.random() < 0.22 ? 1 : 0),
          ys = [];
        for (let i = 0; i < n; i++) {
          let yy,
            t = 0;
          do {
            yy =
              i === 0 && Math.random() < 0.5
                ? habitY() + (Math.random() * 2 - 1)
                : BOT + 3 + Math.random() * (CLO + 1 - BOT - 3);
            yy = Math.max(BOT + 3, Math.min(CEIL - 0.8, yy));
            t++;
          } while (t < 8 && ys.some((q) => Math.abs(q - yy) < 3.2));
          ys.push(yy);
        }
        const kinds = ['hunter'];
        if (score >= 3) kinds.push('feint');
        if (score >= 6) kinds.push('dash');
        if (score >= 9) kinds.push('sweeper');
        const pincer = n >= 2 && Math.random() < 0.5;
        ys.forEach((yy, i) => {
          spawnFoe(-(sp() + 4) * (2.4 + i * 0.45), yy, MODES[4].ai * 0.6 * (0.5 + 0.5 * AI.skill));
          const f = foes[foes.length - 1];
          f.y = yy;
          f.g.position.y = yy;
          f.kind = kinds[Math.floor(Math.random() * kinds.length)];
          f.side = Math.random() < 0.5 ? -1 : 1;
          f.fq = 2.6 + Math.random() * 1.2;
          if (f.kind === 'sweeper') f.amp = 1.3 + Math.random() * 0.6;
          if (pincer && i === 1) {
            const f1 = foes[foes.length - 2];
            f.dir = -f1.dir;
            f.x = f.dir * Math.abs(f.x);
          }
        });
        hawkT = Math.max(1.3, 2.6 - score * 0.025) + n * 0.5;
      }
      foes.forEach((f) => {
        if (!f.sc && !f.hit && f.dir * f.x < -0.4) {
          f.sc = true;
          score++;
          hud.textContent = score;
          hud.classList.remove('bump');
          void hud.offsetWidth;
          hud.classList.add('bump');
          sfx.score();
          gainXp(2);
          AI.skill += (Math.max(0, 1 - Math.abs(y - (f.fy || f.y)) / 3) - AI.skill) * 0.2;
          const v =
            1.5 *
            MM() *
            (fxOn('double') ? 2 : 1) *
            (1 + 0.25 * perks.pull) *
            (Math.random() < perks.lucky * 0.15 ? 2 : 1);
          wallet += v;
          run += v;
          saveW();
          popText('+$' + fm(v));
        }
      });
    } else if (mode === 5) {
      const LT = lvType(),
        Dd = lvD(),
        cap = LT === 'dodge' ? lvNeed() : 1e9;
      hawkT -= dt;
      if (LT === 'dodge' && lvSpawned > 0 && hawkT > 0.5 && !foes.some((f) => !f.pc)) hawkT = 0.5; // next group as soon as the last one has passed
      if (LT === 'boss' && !bossOut) {
        bossOut = true;
        bossLineup().forEach((b, k) => spawnBoss(b === 'captain', k % 2 ? -1 : 1, k));
      }
      if (!paused) {
        campT = y > CLO + 0.3 ? Math.min(4, campT + dt) : Math.max(0, campT - 2 * dt);
        if (campT > 1.2) {
          cloudT -= dt;
          if (cloudT <= 0 && hawksActive() < lvMaxActive()) {
            spawnCloudHawk();
            cloudT = (1.3 - 0.5 * Dd) * (0.8 + 0.4 * Math.random());
          }
        } else cloudT = 0.4;
      } /* riding the clouds/ceiling brings hawks up there fast */
      if (hawkT <= 0 && lvSpawned < cap) {
        let n = 1;
        if (Dd > 0.04 && Math.random() < Math.min(0.7, 0.1 + 0.75 * Dd)) n++;
        if (Dd > 0.4 && Math.random() < (Dd - 0.4) * 0.9) n++;
        if (Dd > 0.65 && Math.random() < (Dd - 0.65) * 1.2) n++;
        if (LT !== 'dodge') n = Math.min(n, 2);
        n = Math.min(n, cap - lvSpawned, lvMaxActive() - hawksActive());
        if (n <= 0) {
          hawkT = 0.3;
        } else {
          const ys = [];
          for (let i = 0; i < n; i++) {
            let yy,
              t = 0;
            do {
              yy =
                i === 0 && Math.random() < 0.5
                  ? habitY() + (Math.random() * 2 - 1)
                  : BOT + 3 + Math.random() * (CLO + 1 - BOT - 3);
              yy = Math.max(BOT + 3, Math.min(CEIL - 0.8, yy));
              t++;
            } while (t < 8 && ys.some((q) => Math.abs(q - yy) < 3.2));
            ys.push(yy);
          }
          const kinds = ['hunter'];
          if (level >= 6) kinds.push('feint');
          if (level >= 14) kinds.push('dash');
          if (level >= 20) kinds.push('sweeper');
          const pincer = n >= 2 && level >= 10 && Math.random() < 0.25 + 0.35 * Dd;
          ys.forEach((yy, i) => {
            spawnFoe(-(sp() + 4) * (2.4 + i * 0.45), yy, (0.06 + 0.9 * Dd) * (0.6 + 0.4 * AI.skill));
            const f = foes[foes.length - 1];
            f.y = yy;
            f.g.position.y = yy;
            f.kind = kinds[Math.floor(Math.random() * kinds.length)];
            f.side = Math.random() < 0.5 ? -1 : 1;
            f.fq = 2.6 + Math.random() * 1.2;
            if (f.kind === 'sweeper') f.amp = 1.3 + Math.random() * 0.6;
            if (Math.random() < 0.6) f.sw = (Math.random() < 0.5 ? -1 : 1) * (1.5 + Math.random() * 1.5);
            if (i === 1 && !pincer) f.cut = true;
            if (Math.random() < 0.15 + 0.35 * Dd) {
              f.wantRet = true;
              f.turnX = 5 + Math.random() * 5;
            }
            f.mind = 0.3 + Math.random() * 1.2;
            f.sv = 1;
            f.svT = 1;
            if (pincer && i === 1) {
              const f1 = foes[foes.length - 2];
              f.dir = -f1.dir;
              f.x = f.dir * Math.abs(f.x);
            }
          });
          lvSpawned += n;
          hawkT =
            (n / ((0.65 + 0.55 * Dd) * 1.1 * (LT === 'dodge' ? 1 : LT === 'fly' ? 0.33 : 0.6))) *
            (0.85 + 0.3 * Math.random());
        }
      } // fewer small hawks on butterfly and boss levels
      foes.forEach((f) => {
        if (!f.pc && f.dir * f.x < -0.4) {
          f.pc = true;
          hawkPassed(f);
        }
      });
      foes.forEach((f) => {
        if (!f.sc && !f.hit && f.dir * f.x < -0.4) {
          f.sc = true;
          score++;
          hud.textContent = score;
          hud.classList.remove('bump');
          void hud.offsetWidth;
          hud.classList.add('bump');
          sfx.score();
          gainXp(2);
          AI.skill += (Math.max(0, 1 - Math.abs(y - (f.fy || f.y)) / 3) - AI.skill) * 0.2;
          const v =
            1.5 *
            MM() *
            (fxOn('double') ? 2 : 1) *
            (1 + 0.25 * perks.pull) *
            (Math.random() < perks.lucky * 0.15 ? 2 : 1);
          wallet += v;
          run += v;
          saveW();
          popText('+$' + fm(v));
        }
      });
    }
    for (let i = foes.length - 1; i >= 0; i--) {
      const f = foes[i];
      if (f.dir * f.x < -24) {
        scene.remove(f.g);
        foes.splice(i, 1);
      }
    }
    if (mode === 5) {
      flyT -= dt;
      if (flyT <= 0) {
        spawnFly();
        flyT = BR && lvType() === 'fly' ? 0.9 + Math.random() * 0.6 : 2.6 + Math.random() * 2.4;
      }
    }
    for (let i = flies.length - 1; i >= 0; i--) {
      const f = flies[i];
      aiFlee(f, dt);
      f.hs = (f.hs || 1) + ((f.hsT || 1) - (f.hs || 1)) * (1 - Math.exp(-4 * dt));
      f.x -= f.dir * FLYV * HS() * f.hs * dt;
      const fy = f.y + Math.sin(gt * f.fq * 2 + f.ph) * 0.3;
      f.fy = fy;
      f.g.position.set(f.x, fy, 0);
      f.g.rotation.y = (-f.dir * Math.PI) / 2;
      if (Math.abs(f.x) < 0.8 && Math.abs(y - fy) < 0.75) {
        catchFly(f);
        scene.remove(f.g);
        flies.splice(i, 1);
        continue;
      }
      if (f.dir * f.x < -24) {
        scene.remove(f.g);
        flies.splice(i, 1);
      }
    }
    if (y > CEIL) {
      y = CEIL;
      if (vy > 0) vy = 0;
    }
    if (y < BOT + 0.5) {
      die();
      if (state === 'play') {
        y = BOT + 0.5;
        if (vy < 0) vy = FLAP * 0.6;
      }
    } // ground is solid: if a crash was blocked (shield/life/revive safety), bounce
    // recycle
    while (pipes.length && pipes[0].z > 11) {
      const old = pipes.shift();
      scene.remove(old.g);
      old.pm.p.dispose();
      old.pm.c.dispose();
      const lastZ = pipes[pipes.length - 1].z;
      const np = makePipe(lastZ - SPACING);
      pipes.push(np);
      if (
        score >= 2 &&
        Math.random() < Math.min(0.85, (0.22 + score * 0.02) * MODES[mode - 1].f * (0.7 + 0.6 * AI.skill))
      )
        spawnFoe(foeSlot(lastZ - SPACING * 0.5), np.base, MODES[mode - 1].ai * (0.5 + 0.5 * AI.skill));
    }
    tilt += (Math.max(-0.3, Math.min(0.3, vy * 0.018)) - tilt) * (1 - Math.exp(-6 * dt));
    gTex.offset.y += (sp() * dt) / 10;
    pTex.offset.y += (sp() * dt) / 7;
    gBump.offset.y = gTex.offset.y;
    pBump.offset.y = pTex.offset.y;
    props.forEach((g) => {
      g.position.z += sp() * dt;
      if (g.userData.bx === undefined) g.userData.bx = g.position.x;
      if (g.position.z > 12) {
        g.position.z -= 265;
        g.userData.bx = (Math.random() < 0.5 ? -1 : 1) * (9 + Math.random() * 34);
      }
      g.position.x = g.userData.bx + bendOff(g.position.z);
    });
  }
  if (state === 'dead') {
    vy += GRAV * dt;
    y = Math.max(BOT + 0.5, y + vy * dt);
    tilt += (-0.6 - tilt) * (1 - Math.exp(-3 * dt));
  }
  pipes.forEach((p) =>
    p.coins.forEach((c) => {
      c.m.rotation.y = now / 250;
    }),
  );
  updP(dt, state === 'play' ? sp() : 0);
  flies.forEach((f) => {
    const a = Math.sin(now / 45 + f.ph) * 0.9;
    f.w[0].rotation.z = -a;
    f.w[1].rotation.z = a;
  });
  foes.forEach((f) => {
    const a = Math.sin(now / 70 + f.ph) * 0.7;
    f.w[0].rotation.z = -a;
    f.w[1].rotation.z = a;
    f.gl.scale.setScalar(2.6 + Math.sin(now / 120 + f.ph) * 0.4);
  });
  if (state !== 'play')
    props.forEach((g) => {
      if (g.userData.bx === undefined) g.userData.bx = g.position.x;
      g.position.x = g.userData.bx + bendOff(g.position.z);
    });
  clouds.forEach((c) => {
    if (state === 'play') {
      c.position.z += speed * 0.3 * dt;
      if (c.position.z > 10) c.position.z = -90;
    }
  });

  neonTick(dt);
  const tod = (tod0 + gt / 100) % 1,
    sn = Math.sin(tod * 6.2832),
    dd = Math.min(1, Math.max(0, sn * 2.2 + 0.35)),
    nt0 = 1 - dd,
    nt = Math.max(nt0, neo * 0.9),
    tw = Math.max(0, 1 - Math.abs(sn + 0.05) / 0.3);
  skyU.top.value
    .copy(cTopN)
    .lerp(cTopD, dd)
    .lerp(cTopU, tw * 0.5);
  skyU.bot.value
    .copy(cBotN)
    .lerp(cBotD, dd)
    .lerp(cBotU, tw * 0.8);
  scene.background.copy(skyU.bot.value);
  scene.fog.color.copy(skyU.bot.value);
  hemi.intensity = 0.2 + 0.7 * dd;
  hemi.color.setRGB(0.55 + 0.45 * dd, 0.6 + 0.4 * dd, 0.85 + 0.15 * dd);
  sun.intensity = 0.2 + 0.55 * dd;
  sun.color.setRGB(0.6 + 0.4 * dd, 0.68 + 0.32 * dd, 1);
  sun.position.set(Math.cos(tod * 6.2832) * 28, 22, -4);
  sunM.position.set(Math.cos(tod * 6.2832) * 95 * SKYK, (sn * 70 - 4) * SKYK, SKYZ);
  moonM.position.set(
    (-Math.cos(tod * 6.2832) * 95 - 30) * SKYK,
    (Math.max(-sn, 0) * 20 + Math.min(-sn, 0) * 70 + 16) * SKYK,
    SKYZ,
  );
  updNightSky(Math.max(nt0 * (1 - neo), neo * 0.5), dt, now);
  glowMat.opacity = nt * 0.95;
  pipes.forEach((p) => {
    p.pm.p.emissiveIntensity = p.pm.c.emissiveIntensity = nt * 0.85;
  });
  birdGlow.material.opacity = 0.12 + nt * 0.6;
  birdL.intensity = nt * 2;
  {
    const ei = 0.05 + nt * 0.7;
    birdMats.forEach((q) => {
      q.emissive.copy(q.color).lerp(bTint, 0.5);
      q.emissiveIntensity = ei;
    });
  }
  coinMat.emissiveIntensity = sideMat.emissiveIntensity = 0.35 + nt * 1.8;
  faceMat.emissiveIntensity = 0.2 + nt * 1.1;
  rimMat.uniforms.k.value = 0.22 + nt * 0.28;
  bankTint.setRGB(0.26 + 0.74 * dd + 0.1 * tw, 0.3 + 0.7 * dd, 0.5 + 0.5 * dd).lerp(cBank, neo);
  {
    let wh = 0;
    banks.forEach((b) => {
      if (state === 'play' && !paused) b.position.z += sp() * dt * 0.9;
      if (b.position.z > 9) bankReset(b, true);
      const a = mode === 5 ? 1 : Math.max(0, Math.min(1, (b.position.y - CLO) / 6)),
        op = b.userData.o * a * a * (3 - 2 * a);
      b.material.opacity = op;
      b.material.color.copy(bankTint);
      const dx = b.position.x - cam.position.x,
        dy = b.position.y - cam.position.y,
        dz = b.position.z - cam.position.z,
        d = Math.sqrt(dx * dx + dy * dy + dz * dz),
        rr = b.userData.sz * 0.5;
      if (d < rr) wh += (1 - d / rr) * op * 1.5;
    });
    if (mode === 5) {
      const k = Math.max(0, Math.min(1, (y - CLO) / 1.2));
      wh = k * k * (3 - 2 * k) * 0.97;
    }
    cloudFx.style.opacity = Math.min(mode === 5 ? 0.97 : 0.88, wh);
    cloudFx.style.background =
      'rgb(' +
      Math.round(bankTint.r * 255) +
      ',' +
      Math.round(bankTint.g * 255) +
      ',' +
      Math.round(bankTint.b * 255) +
      ')';
  }
  cloudMat.color.setRGB(0.2 + 0.8 * dd + 0.1 * tw, 0.25 + 0.75 * dd - 0.08 * tw, 0.4 + 0.6 * dd - 0.2 * tw);

  neoPulse = neo > 0 ? beatPulse(now) : 0;
  neonApply();
  updMountains(dd, nt0, tw, neo, neoPulse);
  ffMat.opacity = S.particles === 'off' ? 0 : nt * 0.9;
  if (ffMat.opacity > 0.02) {
    const wz = state === 'play' ? sp() * dt : 0;
    for (let i = 0; i < FF; i++) {
      ffPos[i * 3 + 2] += wz;
      if (ffPos[i * 3 + 2] > 12) ffPos[i * 3 + 2] -= 100;
      ffPos[i * 3 + 1] += Math.sin(now / 700 + ffSeed[i]) * 0.003;
      ffPos[i * 3] += Math.cos(now / 900 + ffSeed[i]) * 0.004;
    }
    ffGeo.attributes.position.needsUpdate = true;
  }
  updFx();
  shake *= Math.exp(-5 * dt);
  {
    let tg = 0;
    if (state === 'play') {
      tg = Math.min(1, score / 35) * 0.55;
      let nz = 99;
      foes.forEach((f) => {
        if (!f.hit && f.z < 2 && f.z > -30) nz = Math.min(nz, -f.z);
      });
      if (nz < 99) tg += 0.3 * (1 - Math.max(0, nz) / 30);
      if (score >= 2 && wallet < 5 + Math.floor(score / 4)) tg += 0.1;
    }
    mStress += (Math.min(1, tg) - mStress) * (1 - Math.exp(-1.2 * dt));
    mCx = Math.min(1, (score + level * 3) / 60);
  }
  if (mBus) {
    const mt =
      muted || !S.musicOn
        ? 0
        : Math.round(
            (state === 'play' && !paused && !hold ? 0.35 + 0.25 * (S.dyn ? mStress : 0.3) : 0.2) *
              S.master *
              S.music *
              100,
          ) / 100;
    if (mt !== mTgt) {
      mTgt = mt;
      mBus.gain.setTargetAtTime(mt, AC.currentTime, 0.2);
    }
  }
  if (state === 'ready') tilt += (0 - tilt) * (1 - Math.exp(-6 * dt));
  curv = mode === 5 ? kap(RS) / KAP : 0;
  if (mode === 5 || curvApplied) {
    buildBend();
    applyCurve();
    curvApplied = mode === 5 ? 1 : 0;
  }
  {
    const fn = mode === 5 ? 48 : 25,
      ff = mode === 5 ? 210 : 95,
      k = 1 - Math.exp(-1.5 * dt);
    scene.fog.near += (fn - scene.fog.near) * k;
    scene.fog.far += (ff - scene.fog.far) * k;
  }
  camY += (3.5 + y * (mode === 5 ? 0.8 : 0.7) - camY) * (1 - Math.exp(-4 * dt));
  camL += (y * (mode === 5 ? 1 : 0.85) - camL) * (1 - Math.exp(-5 * dt));
  const shk = S.shake ? shake : 0;
  vb += ((viewSide || mode === 5 ? 1 : 0) - vb) * (1 - Math.exp(-4 * dt));
  cam.position.set(vb * 8 + Math.sin(now / 40) * shk * 0.25, camY + Math.cos(now / 47) * shk * 0.25, 8);
  {
    const el = (now - flapAt) / 1000;
    let a;
    if (state === 'ready') a = Math.sin(now / 110) * 0.5;
    else if (state === 'dead') a = 0.6;
    else a = Math.max(0, 1 - el * 2.2) * Math.sin(el * 38) * 0.9 + (vy < 0 ? 0.25 : 0);
    wings[0].rotation.z = -a;
    wings[1].rotation.z = a;
  }
  if (y < BOT + 0.5) y = BOT + 0.5; // never below the ground, in any state
  bird.position.set(0, y, 0);
  bird.userData.bank = curv * 0.12;
  backL.position.set(0, y + 1.6, -4.5);
  backL.intensity = 0.3 + nt * 0.3;
  {
    const fl = Math.max(0, 1 - (now - flapAt) / 170);
    bird.scale.set(1 - 0.08 * fl, 1 + 0.12 * fl, 1 - 0.08 * fl);
  }
  bird.rotation.set(tilt * 1.6, 0, state === 'dead' ? -tilt * 1.2 : Math.sin(now / 500) * 0.05 - bird.userData.bank);
  bird.visible = !(ghost > gt) || Math.floor(now / 90) % 2 === 0;
  shadow.scale.setScalar(Math.max(0.3, 1.4 - (y + 6) * 0.09));
  shadow.material.opacity = Math.max(0.08, 0.35 - (y + 6) * 0.02);
  {
    const tf =
      S.fov + Math.min(0.45, gt * 0.0025) * 18 + (state === 'play' ? Math.max(0, 1 - (now - flapAt) / 200) * 1.5 : 0);
    if (Math.abs(cam.fov - tf) > 0.02) {
      cam.fov += (tf - cam.fov) * (1 - Math.exp(-6 * dt));
      cam.updateProjectionMatrix();
    }
  }
  cam.lookAt(bendOff(-40) * 0.9, camL, -8 + vb * 4.5);
  cam.rotateZ(-curv * 0.035);
  {
    const W = [null, null];
    if (state === 'play' && !paused && !hold)
      foes.forEach((f) => {
        const si = f.dir < 0 ? 0 : 1;
        if (!f.hit && f.dir * f.x > 0 && f.dir * f.x < FVX * 2.6 && (!W[si] || Math.abs(f.x) < Math.abs(W[si].x)))
          W[si] = f;
      });
    [warn2, warnEl].forEach((el, i) => {
      const wf = W[i];
      if (wf) {
        cam.updateMatrixWorld();
        wpv.set(0, wf.ty !== undefined ? wf.ty : wf.fy === undefined ? wf.y : wf.fy, 0).project(cam);
        el.style.display = 'block';
        el.style.top = Math.max(8, Math.min(88, ((1 - wpv.y) / 2) * 100)) + '%';
        if (!wf.warned) {
          wf.warned = true;
          tone(880, 880, 0.09, 'square', 0.06);
          tone(880, 880, 0.09, 'square', 0.06, 0.14);
        }
      } else el.style.display = 'none';
    });
  }
  {
    const ui = (state === 'play' && !hold ? 'play' : state) + (mode === 5 ? '5' : '');
    if (ui !== uiLast) {
      uiLast = ui;
      document.body.dataset.st = state === 'play' && !hold ? 'play' : state;
      document.body.classList.toggle('m5', mode === 5);
    }
  }
  if (composer && S.bloom) composer.render(dt);
  else renderer.render(scene, cam);
}
