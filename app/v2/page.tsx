'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { MeshGradient } from '@paper-design/shaders-react'
import styles from './page.module.css'

type VerificationState = 'idle' | 'loading' | 'error' | 'success'

const OTP_LENGTH = 6
const LOADING_DELAY_MS = 1300

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

const normalizeCode = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, OTP_LENGTH)

export default function GiftCardV2Page() {
  const [voucherCode, setVoucherCode] = useState('')
  const [verificationState, setVerificationState] = useState<VerificationState>('idle')
  const [resolvedCode, setResolvedCode] = useState('')
  const [isOtpFocused, setIsOtpFocused] = useState(false)
  const [isCardHovered, setIsCardHovered] = useState(false)
  const [isCardParallax, setIsCardParallax] = useState(false)

  const successSoundRef = useRef<HTMLAudioElement | null>(null)
  const errorSoundRef = useRef<HTMLAudioElement | null>(null)
  const hiddenOtpInputRef = useRef<HTMLInputElement | null>(null)
  const verificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cardSceneRef = useRef<HTMLDivElement | null>(null)

  const normalizedCode = useMemo(() => normalizeCode(voucherCode), [voucherCode])
  const otpSlots = useMemo(
    () => Array.from({ length: OTP_LENGTH }, (_, index) => normalizedCode[index] ?? ''),
    [normalizedCode],
  )

  const isLoading = verificationState === 'loading'
  const isSuccess = verificationState === 'success'
  const isError = verificationState === 'error'
  const isVerifyLocked = isSuccess && normalizedCode.length > 0 && normalizedCode === resolvedCode
  const canVerify = normalizedCode.length > 0 && !isLoading && !isVerifyLocked
  const hasTypedCode = normalizedCode.length > 0
  const frontCardText = isLoading ? 'جاري التحقق' : isError ? 'انتهت صلاحية هذا الرمز' : normalizedCode

  const activeOtpIndex = isOtpFocused ? Math.min(normalizedCode.length, OTP_LENGTH - 1) : -1

  useEffect(() => {
    successSoundRef.current = new Audio('/assets/figma/sr-sequence.mp3')
    errorSoundRef.current = new Audio('/assets/figma/error.wav')

    return () => {
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current)
        verificationTimeoutRef.current = null
      }
    }
  }, [])

  const focusOtpInput = () => {
    if (isLoading) return
    hiddenOtpInputRef.current?.focus()
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (isLoading) return
    if (!normalizedCode) {
      setVerificationState('idle')
      return
    }
    if (isVerifyLocked) return

    setVerificationState('loading')
    const currentCode = normalizedCode

    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current)
      verificationTimeoutRef.current = null
    }

    verificationTimeoutRef.current = setTimeout(() => {
      verificationTimeoutRef.current = null

      if (currentCode === 'AA123') {
        setVerificationState('error')
        setResolvedCode(currentCode)
        if (errorSoundRef.current) {
          errorSoundRef.current.currentTime = 0
          void errorSoundRef.current.play().catch(() => {})
        }
        return
      }

      setVerificationState('success')
      setResolvedCode(currentCode)
      if (successSoundRef.current) {
        successSoundRef.current.currentTime = 0
        void successSoundRef.current.play().catch(() => {})
      }
    }, LOADING_DELAY_MS)
  }

  return (
    <div className={styles.page}>
      <section className={styles.heroSection}>
        <header className={styles.navigationBar}>
          <div className={styles.navLeftActions}>
            <button className={`${styles.pillButton} ${styles.loginButton}`} type="button">
              الدخول
            </button>
            <button className={styles.iconButton} type="button" aria-label="بحث">
              <img src="/assets/figma/icon-search.svg" alt="" />
            </button>
          </div>
          <img className={styles.navLogo} src="/assets/figma/logo-nav.svg" alt="ثمانية" />
          <img className={styles.navigationDivider} src="/assets/figma/nav-divider.svg" alt="" />
        </header>

        <div className={styles.heroContent}>
          <div className={styles.visualColumn}>
            <div className={styles.visualPanel}>
              <div className={styles.shaderBackground} aria-hidden="true">
                <MeshGradient
                  speed={1}
                  scale={1}
                  distortion={0.8}
                  swirl={0.1}
                  colors={['#000000', '#00BC6D', '#000000', '#00BC6D']}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
              <div className={styles.giftCardStack}>
                <div
                  className={`${styles.giftCardPerspective}${isError ? ` ${styles.giftCardPerspectiveError}` : ''}`}
                >
                  <div
                    ref={cardSceneRef}
                    className={styles.giftCardScene}
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
                    <article className={`${styles.giftCardInner}${isSuccess ? ` ${styles.giftCardInnerFlipped}` : ''}`}>
                      <div className={`${styles.giftCardPanel} ${styles.giftCardPanelFront}`}>
                        <div className={styles.giftCardPanelContent}>
                          <div className={`${styles.frontDynamic}${hasTypedCode ? ` ${styles.frontDynamicFilled}` : ''}`}>
                            <div className={styles.frontSymbolWrap}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="74"
                                height="86"
                                viewBox="0 0 74 86"
                                fill="none"
                                className={styles.frontSymbol}
                                role="img"
                                aria-label="شعار ثمانية"
                              >
                                <path
                                  d="M19.0226 85.1055C29.6955 71.7435 34.0064 58.3626 35.8813 44.5395H37.6197C39.4946 58.3626 43.8056 71.7437 54.4784 85.1055H55.53L73.501 49.2707C52.5679 37.4284 44.1015 21.1339 38.1215 -0.000915527H35.3796C29.3996 21.1339 20.9331 37.4284 0 49.2707L17.971 85.1055H19.0226Z"
                                  fill="white"
                                />
                              </svg>
                            </div>
                            <p className={`${styles.frontCode}${isError ? ` ${styles.frontCodeError}` : ''}`}>{frontCardText}</p>
                          </div>
                        </div>
                      </div>

                      <div className={`${styles.giftCardPanel} ${styles.giftCardPanelBack}`}>
                        <div className={styles.giftCardPanelContent}>
                          <div className={styles.cardTop}>
                            <div className={styles.cardBrandRow}>
                              <img className={styles.cardBrandIcon} src="/assets/figma-v2/subscription-brand.svg" alt="" />
                              <p className={styles.cardBrandText}>اشتراك ثمانية</p>
                            </div>
                            <img className={styles.cardPlanPrice} src="/assets/figma-v2/card-plan-price.svg" alt="شهر مجاناً" />
                          </div>

                          <div className={styles.cardMeta}>
                            <p className={styles.cardMetaLabel}>من</p>
                            <p className={styles.cardMetaBank}>بنك الراجحي</p>
                            <p className={styles.cardMetaExpiry}>ينتهي في 12 مايو 2026</p>
                          </div>

                          <img className={styles.cardShape} src="/assets/figma-v2/card-shape.png" alt="" />
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              </div>

              <div className={styles.statusArea}>
                {isLoading && <p className={styles.loadingPill}>جاري تفعيل اشتـــراكك…</p>}
                {isSuccess && !isLoading && (
                  <button className={styles.activationButton} type="button">
                    تفعيل الاشتراك
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={styles.redemptionPanel}>
            <h1 className={styles.redemptionHeading}>استرد قسيمتك.</h1>

            <div className={styles.redemptionTextGroup}>
              <p className={styles.redemptionSubtitle}>ادخل الرمز لتفعيل القسيمة.</p>
              <p className={styles.redemptionDescription}>
                هنا مساحة لكتابة تفاصيل توضيحية أكثر. ممكن نجاوب عليها هنا بشكل مختصر بدل من قسم الأسئلة.
              </p>
            </div>

            <form className={styles.redemptionForm} onSubmit={handleSubmit}>
              <label className={styles.srOnly} htmlFor="voucher-code-v2">
                رمز القسيمة
              </label>

              <div
                className={styles.otpField}
                onClick={focusOtpInput}
                role="group"
                aria-label="رمز القسيمة"
                data-focused={isOtpFocused ? 'true' : 'false'}
              >
                {otpSlots.map((character, index) => {
                  const isFilled = character.length > 0
                  const isFocusSlot = activeOtpIndex === index

                  return (
                    <div
                      key={index}
                      className={`${styles.otpSlot}${isFilled ? ` ${styles.otpSlotFilled}` : ''}${
                        isFocusSlot ? ` ${styles.otpSlotFocus}` : ''
                      }`}
                      aria-hidden="true"
                    >
                      {isFocusSlot && !character ? (
                        <img className={styles.otpCaret} src="/assets/figma-v2/otp-caret.svg" alt="" />
                      ) : (
                        <span>{character}</span>
                      )}
                    </div>
                  )
                })}

                <input
                  id="voucher-code-v2"
                  ref={hiddenOtpInputRef}
                  className={styles.hiddenOtpInput}
                  type="text"
                  inputMode="text"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="one-time-code"
                  value={normalizedCode}
                  maxLength={OTP_LENGTH}
                  disabled={isLoading}
                  onFocus={() => setIsOtpFocused(true)}
                  onBlur={() => setIsOtpFocused(false)}
                  onChange={(event) => {
                    const nextCode = normalizeCode(event.target.value)
                    setVoucherCode(nextCode)
                    if (!isLoading && nextCode !== resolvedCode) {
                      setVerificationState('idle')
                    }
                  }}
                />
              </div>

              <div className={styles.verifyArea}>
                <button className={styles.verifyButton} type="submit" disabled={!canVerify}>
                  تحقق من الرمز
                </button>
              </div>

              {isError && <p className={styles.errorText}>انتهت صلاحية هذا الرمز</p>}
            </form>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLinksArea}>
            <div className={styles.footerLogoWrap}>
              <img className={styles.footerLogo} src="/assets/figma/logo-footer.svg" alt="ثمانية" />
            </div>
            <nav className={styles.footerLinks} aria-label="روابط">
              {footerLinks.map((link) => (
                <a className={styles.footerLink} key={link} href="#">
                  {link}
                </a>
              ))}
            </nav>
          </div>

          <div className={styles.footerCredits}>
            <img className={styles.footerDivider} src="/assets/figma/footer-divider.svg" alt="" />
            <div className={styles.footerBottomRow}>
              <div className={styles.socialLinksGroup}>
                <a href="#" className={styles.langLink}>
                  EN
                </a>
                <div className={styles.socialIcons}>
                  {socialLinks.map((social) => (
                    <a key={social.name} href="#" aria-label={social.name} className={styles.socialIconLink}>
                      <img src={social.icon} alt="" />
                    </a>
                  ))}
                </div>
              </div>
              <p className={styles.copyright}>جميع الحقوق محفوظة لشركة ثمانية للنشر والتوزيع ©</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
