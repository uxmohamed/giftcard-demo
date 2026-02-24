'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
// import { useDialKit } from 'dialkit' // Removed for production

const ANIMATION_PARAMS = {
  'Card Flip': { duration: 800 },
  'Reveal Open': { delay: 850, duration: 480 },
  'Reveal Close': { delay: 0, duration: 600 },
  'Button Fade Open': { delay: 900, duration: 1000 },
  'Button Fade Close': { delay: 0, duration: 245 },
  loadingDelay: 1300,
}

const footerLinks = [
  'مركز المساعدة',
  'شروط الاستخدام',
  'سياسة الخصوصية',
  'التواصل',
  'عن ثمانية',
]

const socialLinks = [
  { name: 'Facebook', icon: '/assets/figma/icon-facebook.svg' },
  { name: 'Instagram', icon: '/assets/figma/icon-instagram.svg' },
  { name: 'X', icon: '/assets/figma/icon-x.svg' },
  { name: 'YouTube', icon: '/assets/figma/icon-youtube.svg' },
]

export default function HomePage() {
  const [voucherCode, setVoucherCode] = useState('')
  const [verificationState, setVerificationState] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [resolvedCode, setResolvedCode] = useState('')
  const [isCardHovered, setIsCardHovered] = useState(false)
  const [isCardParallax, setIsCardParallax] = useState(false)
  const trimmedCode = voucherCode.trim()
  const successSoundRef = useRef<HTMLAudioElement | null>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    successSoundRef.current = new Audio('/assets/figma/sr-sequence.mp3')
  }, [])

  // ── Animation params (static) ─────────────────────────────────────────────
  const p = ANIMATION_PARAMS

  // ── Write CSS vars on mount ───────────────────────────────────────────────
  useEffect(() => {
    const el = pageRef.current
    if (!el) return
    el.style.setProperty('--flip-duration', `${p['Card Flip'].duration}ms`)
    el.style.setProperty('--reveal-open-delay', `${p['Reveal Open'].delay}ms`)
    el.style.setProperty('--reveal-open-duration', `${p['Reveal Open'].duration}ms`)
    el.style.setProperty('--reveal-close-delay', `${p['Reveal Close'].delay}ms`)
    el.style.setProperty('--reveal-close-duration', `${p['Reveal Close'].duration}ms`)
    el.style.setProperty('--btn-fade-open-delay', `${p['Button Fade Open'].delay}ms`)
    el.style.setProperty('--btn-fade-open-duration', `${p['Button Fade Open'].duration}ms`)
    el.style.setProperty('--btn-fade-close-delay', `${p['Button Fade Close'].delay}ms`)
    el.style.setProperty('--btn-fade-close-duration', `${p['Button Fade Close'].duration}ms`)
  }, [])

  const isLoading = verificationState === 'loading'
  const isSuccess = verificationState === 'success'
  const isError = verificationState === 'error'
  const hasTypedCode = trimmedCode.length > 0

  const frontCardText =
    isLoading
      ? 'جاري التحقق'
      : isError
        ? 'انتهت صلاحية هذا الرمز'
        : trimmedCode

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (verificationState === 'loading') return
    if (!trimmedCode) { setVerificationState('idle'); return }
    if (verificationState === 'success' && trimmedCode === resolvedCode) return

    setVerificationState('loading')
    const currentCode = trimmedCode

    setTimeout(() => {
      if (currentCode === 'AA123') {
        setVerificationState('error')
        setResolvedCode(currentCode)
        return
      }
      setVerificationState('success')
      setResolvedCode(currentCode)
      if (successSoundRef.current) {
        successSoundRef.current.currentTime = 0
        successSoundRef.current.play().catch(() => {})
      }
    }, p.loadingDelay)
  }

  return (
    <div ref={pageRef} className="gift-card-page" data-name="Home" data-node-id="4237:47628">
      <section className="hero-section" data-name="Hero section" data-node-id="4237:47629">
        <header className="navigation-bar" data-name="Navaigation" data-node-id="4237:47643">
          <div className="nav-left-actions" data-node-id="I4237:47643;1:15677">
            <button className="pill-button login-button" type="button" data-node-id="I4237:47643;1:15678">
              الدخول
            </button>
            <button className="icon-button" type="button" aria-label="بحث" data-node-id="1817:75770">
              <img src="/assets/figma/icon-search.svg" alt="" />
            </button>
          </div>
          <img className="nav-logo" src="/assets/figma/logo-nav.svg" alt="ثمانية" data-node-id="I4237:47643;1:15685" />
          <img className="navigation-divider" src="/assets/figma/nav-divider.svg" alt="" />
        </header>

        <div className="gift-card-stack">
          <div className={`gift-card-perspective${isError ? ' is-error' : ''}`}>
            <motion.div
              className="gift-card-flip-scene"
              style={{ transformStyle: 'preserve-3d' }}
              data-active={isCardHovered ? 'true' : 'false'}
              data-parallax={isCardParallax ? 'true' : 'false'}
              onPointerEnter={(event) => {
                setIsCardHovered(true)
                setIsCardParallax(false)
                const rect = event.currentTarget.getBoundingClientRect()
                const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
                const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1)
                const ratioX = 0.5 + (x - 0.5) * 2 * 0.5
                const ratioY = 0.5 + (y - 0.5) * 2 * 0.5
                event.currentTarget.style.setProperty('--ratio-x', ratioX.toFixed(4))
                event.currentTarget.style.setProperty('--ratio-y', ratioY.toFixed(4))
              }}
              onPointerMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect()
                const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
                const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1)
                const ratioX = 0.5 + (x - 0.5) * 2 * 0.5
                const ratioY = 0.5 + (y - 0.5) * 2 * 0.5
                event.currentTarget.style.setProperty('--ratio-x', ratioX.toFixed(4))
                event.currentTarget.style.setProperty('--ratio-y', ratioY.toFixed(4))
              }}
              onPointerLeave={() => {
                setIsCardHovered(false)
                setIsCardParallax(false)
              }}
              onTransitionEnd={(event) => {
                if (event.target !== event.currentTarget) return
                if (event.propertyName !== 'transform') return
                if (!isCardHovered) return
                setIsCardParallax(true)
              }}
            >
              <article className={`gift-card-flip-inner${isSuccess ? ' is-flipped' : ''}`} data-node-id="4237:48048">
                <div className="gift-card-panel gift-card-panel-front">
                  <div className="gift-card-panel-content">
                    <div className={`gift-card-front-dynamic${hasTypedCode ? ' is-filled' : ''}`}>
                      <div className="gift-card-symbol-wrap" data-node-id="4237:48050">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="74"
                          height="86"
                          viewBox="0 0 74 86"
                          fill="none"
                          className="gift-card-symbol"
                          role="img"
                          aria-label="شعار ثمانية"
                        >
                          <path
                            d="M19.0226 85.1055C29.6955 71.7435 34.0064 58.3626 35.8813 44.5395H37.6197C39.4946 58.3626 43.8056 71.7437 54.4784 85.1055H55.53L73.501 49.2707C52.5679 37.4284 44.1015 21.1339 38.1215 -0.000915527H35.3796C29.3996 21.1339 20.9331 37.4284 0 49.2707L17.971 85.1055H19.0226Z"
                            fill="white"
                          />
                        </svg>
                      </div>
                      <p className={`gift-card-front-code${isError ? ' is-error' : ''}`} data-node-id="4237:48052">
                        {frontCardText}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="gift-card-panel gift-card-panel-back" data-node-id="4237:47703">
                  <div className="gift-card-panel-content">
                    <div className="gift-card-back-offer" data-node-id="4556:59556">
                      <div className="gift-card-back-tag" data-node-id="4556:59563">
                        <img src="/assets/figma/icon-subscription.svg" alt="" className="gift-card-back-tag-icon" />
                        <p className="gift-card-back-tag-text">اشتــراك ثمانية</p>
                      </div>
                      <p className="gift-card-back-duration" data-node-id="4556:59564">
                        لمـدة 7 ايـــام
                      </p>
                    </div>
                    <div className="gift-card-back-meta" data-node-id="4556:59559">
                      <p className="gift-card-back-label" data-node-id="4556:59560">من</p>
                      <p className="gift-card-back-bank" data-node-id="4556:59571">بنك الراجحي</p>
                      <p className="gift-card-back-expiry" data-node-id="4556:59570">ينتهي في 12 مايو 2026</p>
                    </div>
                  </div>
                </div>
              </article>
            </motion.div>
          </div>

          <div className={`activate-button-reveal${isSuccess ? ' is-open' : ''}`}>
            <div className="activate-button-reveal-inner">
              <button className="activate-button activate-button-below" type="button">
                تفعيل الاشتراك
              </button>
            </div>
          </div>
        </div>

        <div className="redemption-panel" data-node-id="4237:47632">
          <h1 className="redemption-heading" data-node-id="4237:48115">
            استرداد هديتك
          </h1>
          <p className="redemption-subtitle" data-node-id="4237:47635">
            أدخل رمز القسيمة أدناه
          </p>
          <form className="redemption-form" data-node-id="4237:47636" onSubmit={handleSubmit}>
            <div className="redemption-form-row" data-node-id="4237:47638">
              <button
                className="pill-button verify-button"
                type="submit"
                data-node-id="4237:47639"
                disabled={verificationState === 'loading'}
              >
                تحقق من الرمز
              </button>
              <label className="voucher-field-wrap" data-node-id="4237:47640">
                <span className="sr-only">رمز القسيمة</span>
                <input
                  className="voucher-field"
                  type="text"
                  placeholder="رمز القسيمة"
                  value={voucherCode}
                  onChange={(event) => {
                    const nextCode = event.target.value.toUpperCase()
                    setVoucherCode(nextCode)
                    if (verificationState !== 'loading' && nextCode.trim() !== resolvedCode) {
                      setVerificationState('idle')
                    }
                  }}
                  disabled={verificationState === 'loading'}
                />
              </label>
            </div>
          </form>
        </div>
      </section>

      <footer className="footer" data-name="Footer" data-node-id="1817:73687">
        <div className="footer-inner" data-node-id="1817:73694">
          <div className="footer-links-area" data-node-id="1817:73695">
            <div className="footer-logo-wrap" data-node-id="1817:73696">
              <img className="footer-logo" src="/assets/figma/logo-footer.svg" alt="ثمانية" />
            </div>
            <nav className="footer-links" aria-label="روابط" data-node-id="1817:73698">
              {footerLinks.map((link) => (
                <a className="footer-link" key={link} href="#">{link}</a>
              ))}
            </nav>
          </div>
          <div className="footer-credits" data-node-id="1817:73704">
            <img className="footer-divider" src="/assets/figma/footer-divider.svg" alt="" />
            <div className="footer-bottom-row" data-node-id="1817:73706">
              <div className="social-links-group" data-node-id="1817:73707">
                <a href="#" className="lang-link">EN</a>
                <div className="social-icons">
                  {socialLinks.map((social) => (
                    <a key={social.name} href="#" aria-label={social.name} className="social-icon-link">
                      <img src={social.icon} alt="" />
                    </a>
                  ))}
                </div>
              </div>
              <p className="copyright">جميع الحقوق محفوظة لشركة ثمانية للنشر والتوزيع ©</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
