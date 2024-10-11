// Example: /screens/HomeScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button, I18nManager, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setLoading, resetLoading } from '../redux/slices/authSlice';
import colors from '../Utils/colors';
import { logoutBeforeCompanySelectionApi } from '../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

const ResetPasswordScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { userProfile } = useSelector(state => state.auth);
    const { language } = useSelector(state => state.language);

    useEffect(() => {
        console.log('isResetPassswordTriggered------------', userProfile.tenantid);
        console.log('isResetPassswordTriggered-----userId-------', userProfile?.userId);
        dispatch(resetLoading());
    }, [])

    const getHeader = async () => {
        const lngId = language == 'ar' ? '2' : '1';
        return { langid: lngId, userid: userProfile?.userId, session: userProfile?.session, tenantid: userProfile?.tenantid };
    }

    const logoutFunc = async () => {
        try {
            dispatch(setLoading());
            const headers = await getHeader();
            const res = await logoutBeforeCompanySelectionApi({ userId: userProfile?.userId }, headers)
            const data = res.response;
            console.log('dara', data);
            if (data) {
                dispatch(logout());
                navigation?.replace('Login');
                Toast.show({
                    type: 'success', // 'error', 'info' can also be used
                    text1: data?.btiMessage?.message || t('success'),
                    text2: t('success') + '!',
                });
            }
        } catch (error) {
            dispatch(logout());
            Toast.show({
                type: 'error', // 'error', 'info' can also be used
                text1: t('serverErrorText'),
                text2: t('error') + '!',
            });
            console.log('LogoutError', error);
            dispatch(resetLoading());
        }
    }

    return (
        <ScrollView
            removeClippedSubviews={true}
            showsVerticalScrollIndicator={false}
            style={styles.container}>

            <View style={{ marginVertical: 50 }}>
                <Text style={styles.title}>
                    {/* {'welcome in Reset password' + userId} */}
                    {'Terms and Conditions'} {' | '} {'الشروط و الأحكام'}
                </Text>
                <Text style={styles.descriptionHeader}>
                    اتفاقية المستخدم الشروط والأحكام مقدمة اتفاقية الاستخدام
                </Text>
                <Text style={styles.description}>
                    شركة بوادر الثقة الدولية المحدودة ترحّب بكم ، المسجّلة بالسجل التجاري رقم (4030171404) ، وتبلغكم
                    بأنكم سوف تجدون أدناه الشروط والأحكام المُنظّمة لاستخدامكم لهذا المتجر وكافة الآثار القانونية
                    التي تنتج عن استخدامكم لخدمات المتجر عبر الشبكة العنكبوتية عبر هذه المنصة الالكترونية، حيث أن
                    استخدام أي شخصٍ كان لـ(شركة بوادر الثقة الدولية المحدودة) سواءً كان مستهلكاً لخدمة أو لمنتج
                    المتجر أو غير ذلك فإن هذا موافقة وقبول منه وهو بكامل أهليته المعتبرة شرعاً ونظاماً وقانوناً
                    لكافة مواد وأحكام هذه الاتفاقية وهو تأكيد لالتزامكم بأنظمتها ولما ذُكر فيها، وتسري هذه الاتفاقية
                    على جميع أنواع التعامل بين المستخدم وبين المتجر فيما عدا التعاملات المتعلّقة بالأحوال الشخصية
                    والتعاملات الخاصة بإصدار الصكوك المتعلّقة بالتصرفات الواردة على العقار. وتعتبر هذه الاتفاقية
                    سارية المفعول ونافذة بمجرد قيامكم بالموافقة عليها والبدء في التسجيل بـ(شركة بوادر الثقة الدولية
                    المحدودة) بموجب المادة العاشرة من نظام التعاملات الإلكترونية السعودي.
                </Text>
                <Text style={styles.descriptionHeader}>
                    المادة الأولى - المقدّمة والتعريفات:
                </Text>
                <Text style={styles.description}>
                    يعتبر التمهيد أعلاه جزءاً لا يتجزأ من هذه الاتفاقية، كما تجدون أدناه الدلالات والتعريفات
                    للعبارات الرئيسية المستخدمة في هذه الاتفاقية:
                </Text>
                <Text style={styles.descriptionBullets}>  1.  (المتجر) يقصَد بهذه العبارة (شركة بوادر الثقة الدولية المحدودة)، ويشمل هذا التعريف
                    كافة أشكال (شركة بوادر الثقة الدولية المحدودة) على الشبكة العنكبوتية، سواءً كانت تطبيق
                    إلكتروني، أو موقع الكتروني على الشبكة العنكبوتية، أو محل تجاري.
                </Text>
                <Text style={styles.descriptionBullets}> 2.  (المستخدم) يقصَد بهذه العبارة كل مستهلك يقوم بشراء المنتج أو الخدمة من المتجر عبر
                    منصته الالكترونية.
                </Text>
                <Text style={styles.descriptionBullets}> 3.  (الاتفاقية) يقصَد بهذه العبارة شروط وأحكام هذه الاتفاقية، والتي تحكم وتنظّم العلاقة
                    فيما بين أطراف هذه الاتفاقية.
                </Text>
                <Text style={styles.descriptionHeader}>المادة الثانية - أهلية المستخدم القانونية:</Text>
                <Text style={styles.descriptionBullets}>1. يقر المستخدم بأنه ذا أهلية قانونية معتبرة شرعاً ونظاماً للتعامل مع المتجر، أو أن عمره
                    لا يقل عن ثمانية عشرة عاماً.</Text>
                <Text style={styles.descriptionBullets}>2. يوافق المستخدم بأنه في حال مخالفته لهذه المادة، فإنه يتحمّل تبعات هذه المخالفة أمام
                    الغير.
                </Text>
                <Text style={styles.descriptionHeader}>المادة الثالثة - طبيعة التزام (شركة بوادر الثقة الدولية المحدودة):</Text>

                <Text style={styles.descriptionBullets}>1. إن التزام (شركة بوادر الثقة الدولية المحدودة) تجاه المستهلكين أو المستخدمين هو توفير
                    (الخدمة أو المنتج).</Text>
                <Text style={styles.descriptionBullets}>2. قد توفّر (شركة بوادر الثقة الدولية المحدودة) خدمات أخرى كخدمات ما بعد البيع أو غيرها
                    من الخدمات ذات العلاقة، وذلك يعود لطبيعة ونوع (الخدمة أو المنتج) المطلوبة من المستخدم.
                </Text>
                <Text style={styles.descriptionHeader}>المادة الرابعة - ضوابط استخدام (شركة بوادر الثقة الدولية المحدودة):</Text>
                <Text style={styles.descriptionBullets}>1. يلتزم المستخدم باستخدام المنصة الالكترونية الخاصة بـ (شركة بوادر الثقة الدولية
                    المحدودة) بما يتّفق مع الآداب العامة والأنظمة المعمول بها في المملكة العربية السعودية.
                </Text>
                <Text style={styles.descriptionBullets}>2. يلتزم المستخدم عند شرائه لخدمة أو منتج (شركة بوادر الثقة الدولية المحدودة) ألا يستخدم
                    هذه الخدمة أو المنتج بما يخالف الآداب العامة والأنظمة المعمول بها في المملكة العربية
                    السعودية.
                </Text>


                <Text style={styles.descriptionHeader}>المادة الخامسة - الحسابات والتزامات التسجيل:</Text>
                <Text style={styles.description}>
                    فور التقدم بطلب الانضمام إلى عضوية (شركة بوادر الثقة الدولية المحدودة) كمستخدم تكون ملتزماً
                    بالإفصاح عن معلومات محددة واختيار اسم مستخدم وكلمة مرور سرية لاستعمالها عند الولوج لخدمات (شركة
                    بوادر الثقة الدولية المحدودة). وبذلك تكون قد وافقت على:
                </Text>
                <Text style={styles.descriptionBullets}>1. أن تكون مسؤولاً عن المحافظة على سرية معلومات حسابك وسرية كلمة المرور، وتكون بذلك
                    موافقاً على إعلام (شركة بوادر الثقة الدولية المحدودة) حالاً بأي استخدام غير مفوض به
                    لمعلومات حسابك لدى (شركة بوادر الثقة الدولية المحدودة) أو أي اختراق آخر لمعلوماتك
                    السرية.
                </Text>

                <Text style={styles.descriptionBullets}>2. لن تكون (شركة بوادر الثقة الدولية المحدودة) بأي حال من الأحوال مسؤولًة عن أي خسارة قد
                    تلحق بك بشكل مباشر أو غير مباشر معنويا أو ماديا نتيجة كشف معلومات اسم المستخدم أو كلمة
                    الدخول.
                </Text>

                <Text style={styles.descriptionBullets}>3. أنت تلتزم باستخدام حسابك أو عضويتك لدى (شركة بوادر الثقة الدولية المحدودة) بنفسك، حيث
                    أنك مسؤولاً عنه مسؤولية كاملة، وفي حال استخدام غيرك له فهذه قرينة على أنك قد فوّضته
                    باستخدام المتجر باسمك ولحسابك.
                </Text>

                <Text style={styles.descriptionBullets}>4. أنت تلتزم عند استخدام (شركة بوادر الثقة الدولية المحدودة) أن تستخدمها بكل جدية
                    ومصداقية.
                </Text>

                <Text style={styles.descriptionBullets}>5. أنت تلتزم بالإفصاح عن معلومات حقيقية وصحيحة ومحدثة وكاملة وقانونية عن نفسك حسبما هو
                    مطلوب أثناء التسجيل لدى (شركة بوادر الثقة الدولية المحدودة) وتلتزم بتحديث بياناتك في
                    تغييرها في الواقع أو في حال الحاجة إلى ذلك.
                </Text>

                <Text style={styles.descriptionBullets}>6. إن (شركة بوادر الثقة الدولية المحدودة) تلتزم بالتعامل مع معلوماتك الشخصية وعناوين
                    الاتصال بك بسريّة تامة.
                </Text>

                <Text style={styles.descriptionBullets}>7. إذا تبيّن لـ (شركة بوادر الثقة الدولية المحدودة) بأنك أفصحت عن معلومات غير حقيقية أو
                    غير صحيحة أو غير راهنة أو غير كاملة أو غير قانونية او مخالفة لما جاء في اتفاقية
                    الاستخدام، فإن (شركة بوادر الثقة الدولية المحدودة) تمتلك الحق في وقف أو تجميد أو إلغاء
                    عضويتك أو متجرك وحسابك في المنصة، وذلك دون إلحاق الأضرار بحقوق (شركة بوادر الثقة الدولية
                    المحدودة) الأخرى ووسائلها المشروعة في استرداد حقوقها وحماية باقي المستخدمين.
                </Text>

                <Text style={styles.descriptionBullets}>8. في حالة عدم الالتزام بأي مما ورد أعلاه فإن لإدارة (شركة بوادر الثقة الدولية المحدودة)
                    الحق في إيقاف أو إلغاء متجرك أو عضويتك أو حجبك من الولوج لخدمات (شركة بوادر الثقة
                    الدولية المحدودة) مرة أخرى.
                </Text>

                <Text style={styles.descriptionHeader}> المادة السادسة - الاتصالات الإلكترونية ووسائل التواصل الرسمية:</Text>

                <Text style={styles.descriptionBullets}>
                    1. يوافق أطراف هذه الاتفاقية على أن التواصل يتم عبر البريد الإلكتروني المسجّل في المنصّة.
                </Text>
                <Text style={styles.descriptionBullets} >
                    2. يوافق المستخدم على أن جميع الاتفاقيات والإعلانات والبيانات والاتصالات الأخرى التي تزود
                    بها الكترونياً تقوم مقام مثيلاتها المكتوبة، وهي حجة قائمة بذاتها، في تلبية الاحتياجات
                    النظامية والشرعية.
                </Text>
                <Text style={styles.descriptionBullets} >
                    3. يوافق المستخدم على إمكانية التواصل معه وتبليغه بأي أحكام تخص هذه الاتفاقية أو تخص التعامل
                    معه من خلال قيام إدارة (شركة بوادر الثقة الدولية المحدودة) ببث رسائل عامة ترد إلى كافة
                    المستخدمين أو إلى مستخدمين محددين لـ (شركة بوادر الثقة الدولية المحدودة).
                </Text>

                <Text style={styles.descriptionHeader}>المادة السابعة - التعديلات على اتفاقية الاستخدام والرسوم:</Text>

                <Text style={styles.descriptionBullets}>
                    1. إن (شركة بوادر الثقة الدولية المحدودة) قد تقوم بإعلامك عن أي تعديل على هذه الاتفاقية
                    وفقاً لوسائل التواصل الرسمية بموجب هذه الاتفاقية، وبموجبه تتضاعف التزاماتك أو تتضاءل
                    حقوقك وفقاً لأي تعديلات قد تجرى على هذه الاتفاقية.</Text>
                <Text style={styles.descriptionBullets}>
                    2. في حال الاعتراض على أي تعديل على اتفاقية الاستخدام تأمل منكم (شركة بوادر الثقة
                    الدولية المحدودة) التوقف عن استخدام خدماتها حيث أن مجرد ولوجكم إلى حسابكم في (شركة بوادر
                    الثقة الدولية المحدودة) أو استخدامكم لـ(شركة بوادر الثقة الدولية المحدودة) يُعد قبولًا
                    منكم للتعديلات وموافقة كاملة تامة نافية للجهالة، وتقبل (شركة بوادر الثقة الدولية
                    المحدودة) المناقشة في أي اقتراح بشأن هذه الأحكام.</Text>
                <Text style={styles.descriptionBullets}>
                    3. كافة الرسوم تحتسب بالريال السعودي، وعلى المستخدم دفع كافة الرسوم المستحقة بالمنصة
                    مضافاً إليها أي نفقات أخرى تضيفها (شركة بوادر الثقة الدولية المحدودة)، على أن يتم السداد
                    بواسطة الوسائل المعتمدة والمحددة والمتاحة عن طريق (شركة بوادر الثقة الدولية المحدودة).
                </Text>
                <Text style={styles.descriptionBullets}>
                    4. قد تفرض (شركة بوادر الثقة الدولية المحدودة) رسومًا على بعض المستخدمين وذلك يعتمد على
                    العروض أو المنتجات أو الخدمات التي يطلبونها أو ما تفرضه الدولة من رسوم أو ضرائب على
                    طبيعة المنتج أو الخدمة.</Text>
                <Text style={styles.descriptionBullets}>
                    5. تحتفظ (شركة بوادر الثقة الدولية المحدودة) بحقها في إضافة أو زيادة أو خفض أو خصم أي
                    رسوم أو نفقات بموجب مواد وبنود وأحكام اتفاقية الاستخدام، على أي من المستخدمين أي كان سبب
                    تسجيلهم.</Text>

                <Text style={styles.descriptionHeader}>
                    المادة الثامنة – خدمات الدفع والسداد للمتاجر في (شركة بوادر الثقة الدولية المحدودة):
                </Text>

                <Text style={styles.descriptionBullets}>
                    1. توفّر (شركة بوادر الثقة الدولية المحدودة) عبر شركائها نظام الدفع والسداد في (شركة
                    بوادر الثقة الدولية المحدودة) فيمكن أن يتم عبر الانترنت كليا من خلال خيارات الدفع
                    المتوفرة على (شركة بوادر الثقة الدولية المحدودة) أو من خلال أي طريقة دفع توفرها (شركة
                    بوادر الثقة الدولية المحدودة) من حين لآخر.</Text>
                <Text style={styles.descriptionBullets}>
                    2. يلتزم (شركة بوادر الثقة الدولية المحدودة) بتحديد سعر الخدمة أو المنتج الذي يقوم بعرضه
                    في متجره وفقاً للقيمة السوقية المتعارف عليها.</Text>
                <Text style={styles.descriptionBullets}>
                    3. يلتزم (شركة بوادر الثقة الدولية المحدودة) بتوفير فواتير وسندات قبض وسندات استلام
                    لجميع المبالغ والأرباح التي تنشأ في متجره، ويلتزم بأن يعطي المستخدم فاتورة شرائه لخدمة
                    أو منتج (شركة بوادر الثقة الدولية المحدودة).</Text>
                <Text style={styles.descriptionBullets}>
                    4. يلتزم (شركة بوادر الثقة الدولية المحدودة) بتوفير المواصفات المحاسبية المتعارف عليها
                    في متجره الالكتروني، تطبيقاً لأحكام هذه الاتفاقية، ولما في هذا التنظيم من مصالح قانونية
                    واقتصادية وتجارية وتنظيمية.</Text>

                <Text style={styles.descriptionHeader}>المادة التاسعة - معلوماتك الشخصية ومعلومات تفاصيل العمليات:</Text>
                <Text style={styles.descriptionBullets}>
                    1. يقر المستخدم بأنه يمنح (شركة بوادر الثقة الدولية المحدودة) حقاً غير محدود، وعالمي،
                    ودائم وغير قابل للإلغاء، ومعفي من المصاريف، ومرخص باستخدام معلومات أو مواد شخصية أو غير
                    ذلك مما وفرتها أو زودت بها منصة (شركة بوادر الثقة الدولية المحدودة) أو أعلنتها على
                    المنصة من خلال انضمامك إليها أو استخدامك لها، وذلك عبر النماذج المخصصة للتواصل والتسجيل،
                    أو عبر أية رسالة إلكترونية أو أي من قنوات الاتصال المتاحة بالمنصة. وذلك بهدف تحقيق أي من
                    المصالح التي تراها المنصة.</Text>
                <Text style={styles.descriptionBullets}>
                    2. تخضع أحكام سرية المعلومات الخاصة بالمستهلكين لقواعد "سياسة الخصوصية وسرية المعلومات"
                    الخاصة بـ(شركة بوادر الثقة الدولية المحدودة)، ولما ورد في هذه الاتفاقية من أحكام متعلّقة
                    بسرية المعلومات.</Text>

                <Text style={styles.descriptionHeader}>المادة العاشرة – الملكية الفكرية:</Text>

                <Text style={styles.descriptionBullets}>
                    1. إن حقوق الملكية الفكرية الخاصة بـ(شركة بوادر الثقة الدولية المحدودة) هي حقوق مملوكة
                    لـ (شركة بوادر الثقة الدولية المحدودة) ملكية تامة، سواءً كانت مملوكة لهم قبل تأسيس هذه
                    المنصة الالكترونية أم بعد تأسيسها.</Text>
                <Text style={styles.descriptionBullets}>
                    2. يحترم المستخدم أو المستهلك حقوق الملكية الفكرية الخاصة ب (شركة بوادر الثقة الدولية
                    المحدودة)، والتي من ضمنها (شركة بوادر الثقة الدولية المحدودة) نفسه، والكلمات والشعارات
                    والرموز الأخرى الخاصة ب (شركة بوادر الثقة الدولية المحدودة) أو المعروضة على (شركة بوادر
                    الثقة الدولية المحدودة)، حيث أن (شركة بوادر الثقة الدولية المحدودة)، وكل حق يتبع ب (شركة
                    بوادر الثقة الدولية المحدودة)، هي حقوق مملوكة ملكية فكرية كاملة لـ (شركة بوادر الثقة
                    الدولية المحدودة).</Text>

                <Text style={styles.descriptionHeader}>المادة الحادية عشرة - مسؤولية (شركة بوادر الثقة الدولية المحدودة):</Text>

                <Text style={styles.descriptionBullets}>
                    1. يلتزم (شركة بوادر الثقة الدولية المحدودة) بأن يمارس عمله التجاري عبر هذه المنصة
                    الالكترونية بشكل نظامي ووفقاً للأنظمة المعمول بها في المملكة العربية السعودية، ووفقاً
                    لأحكام هذه الاتفاقية.</Text>
                <Text style={styles.descriptionBullets}>
                    2. (شركة بوادر الثقة الدولية المحدودة) لا تتحمل أي مطالبات تنشأ عن أخطاء أو إهمال، سواء
                    كانت ناتجة بشكل مباشر أو غير مباشر أو عرضي أو عن طريق المستخدم أو عن طريق طرف ثالث مثل
                    شركات الشحن.</Text>
                <Text style={styles.descriptionBullets}>
                    3. يلتزم (شركة بوادر الثقة الدولية المحدودة) ومنسوبيها ومُلّاكها ومن يمثّلهم بأن يكون
                    (المنتج أو الخدمة) سليمة وشرعية ومصرح به وفق قوانين وأنظمة المملكة العربية السعودية ويتم
                    استخدامه لأغراض شرعية.</Text>

                <Text style={styles.descriptionHeader}>المادة الثانية عشرة – سرية المعلومات:</Text>

                <Text style={styles.descriptionBullets}>
                    1. تتخذ (شركة بوادر الثقة الدولية المحدودة) معايير (ملموسة وتنظيمية وتقنية) لحماية
                    المستخدمين ومنع وصول شخص غير مفوض إلى معلومات المستخدمين الشخصية، وحفظها.</Text>
                <Text style={styles.descriptionBullets}>
                    2. تقر كمستخدم بأن الشبكة العنكبوتية ليست وسيلة آمنة تماماً، وسرية معلوماتك الشخصية لا
                    يمكن أن تكون مضمونة 100% عبر (شركة بوادر الثقة الدولية المحدودة).</Text>
                <Text style={styles.descriptionBullets}>
                    3. (شركة بوادر الثقة الدولية المحدودة) ليس لها سيطرة على أفعال أي طرف ثالث، أو الغير،
                    مثل صفحات الانترنت الأخرى الموصولة عن طريق روابط إلى المنصة أو أطراف ثالثة تدعي أنها
                    تمثلك وتمثل آخرين.</Text>
                <Text style={styles.descriptionBullets}>
                    4. أنت تعلم وتوافق على أن (شركة بوادر الثقة الدولية المحدودة) قد تستخدم معلوماتك التي
                    زودتها بها، بهدف تقديم الخدمات لك في (شركة بوادر الثقة الدولية المحدودة)، ولإرسال رسائل
                    تسويقية لك، وان الخصوصية في (شركة بوادر الثقة الدولية المحدودة) تضبط عمليات الجمع
                    والمعالجة والاستخدام والتحويل لمعلومات هويتك الشخصية، وتخضع قواعد سرية المعلومات لـ
                    "سياسة الخصوصية وسرية المعلومات" الخاصة ب (شركة بوادر الثقة الدولية المحدودة).</Text>

                <Text style={styles.descriptionHeader}>
                    المادة الثالثة عشرة - تقييد الولوج أو العضوية:</Text>
                <Text style={styles.description}>
                    يمكن لـ(شركة بوادر الثقة الدولية المحدودة) وقف أو إلغاء عضوية المستخدم أو تقييد ولوج المستخدم
                    إلى خدمات المنصة في أي وقت وبدون إنذار ولأي سبب، ودون تحديد.
                </Text>

                <Text style={styles.descriptionHeader}>المادة الرابعة عشرة – أسعار الشحن:</Text>
                <Text style={styles.description}>
                    قيمة شحن المنتج داخل مدينة جدة 200.00 ريال ومدة التوصيل 1 - 2 يوم عمل.
                </Text>
                <Text style={styles.description}> قيمة الشحن لجميع مناطق المملكة 200.00 ريال ومدة التوصيل 1-5 أيام عمل للمدن الرئيسية.
                </Text>
                <Text style={styles.description}> يتم زيادة 1.00 ريال على كل نصف كيلو.
                </Text>

                <Text style={styles.descriptionHeader}>المادة الخامسة عشرة – سياسة الاستبدال:</Text>

                <Text style={styles.descriptionBullets}>
                    1. مع عدم الإخلال بأحكام الضمان الاتفاقية والنظامية، يحق للمستهلك استبدال المنتج المقدّم
                    إليه من (شركة بوادر الثقة الدولية المحدودة) خلال السبعة الأيام التالية لتاريخ استلام
                    المنتج، ولا يحق له استبدال المنتج بعد مرور السبعة أيام.</Text>
                <Text style={styles.descriptionBullets}>
                    2. يشترط لاستبدال المنتج أن يكون المنتج بحالة سليمة وألا يكون المستهلك قد استخدم المنتج
                    أو حصل على منفعته، ويحق لـ (شركة بوادر الثقة الدولية المحدودة) معاينة المنتج قبل
                    استبداله للتأكد من سلامته.</Text>
                <Text style={styles.descriptionBullets}>
                    3. لا يحق للمستهلك استبدال المنتج في الحالات التالية:
                </Text>
                <Text style={styles.description}>
                    أ‌- إذا كان المنتج تم تصنيعه بناءً على طلب المستهلك أو وفقاً لمواصفات حدّدها، ويستثنى من ذلك
                    المنتجات التي بها عيب أو التي خالفت المواصفات المحدّدة من قبل المستهلك.
                </Text>
                <Text style={styles.description}>
                    ب- إذا ظهر عيب في المنتج بسبب سوء حيازة المستهلك.
                </Text>

                <Text style={styles.descriptionHeader}>المادة السادسة عشرة – سياسة الاسترجاع:</Text>

                <Text style={styles.descriptionBullets}>
                    1. مع عدم الإخلال بأحكام الضمان الاتفاقية والنظامية، يحق للمستهلك فسخ العقد واسترجاع
                    المنتج المقدّم إليه من (شركة بوادر الثقة الدولية المحدودة) خلال السبعة الأيام التالية
                    لتاريخ استلام المنتج، ولا يحق له ذلك المنتج بعد مرور السبعة أيام.</Text>
                <Text style={styles.descriptionBullets}>
                    2. يشترط لاسترجاع المنتج أن يكون المنتج بحالة سليمة وألا يكون المستهلك قد استخدم المنتج
                    أو حصل على منفعته، ويحق لـ (شركة بوادر الثقة الدولية المحدودة) معاينة المنتج قبل
                    استرجاعه للتأكد من سلامته.</Text>
                <Text style={styles.descriptionBullets}>
                    3. تنويه عند تأخر العميل لتسليم الشحنة لشركة الشحن بعد تزويده ببوليصة الاسترجاع أو
                    الاستبدال بمدة تتجاوز 3 أيام، سيتم إلغاء طلب الاسترجاع أو الاستبدال ولن يتم استرداد رسوم
                    الاسترجاع أو الاستبدال بعد إصدار بوليصة الشحن.</Text>
                <Text style={styles.descriptionBullets}>
                    4. تبلغ رسوم الشحن للاسترجاع 200.00 ريال وتبلغ رسوم الاستبدال 200.00 ريال للطلبات من
                    داخل المملكة العربية السعودية</Text>
                <Text style={styles.descriptionBullets}>
                    5. لا يحق للمستهلك استرجاع المنتج في الحالات التالية:</Text>

                <Text style={styles.descriptionBullets}> إذا كان المنتج تم تصنيعه بناءً على طلب المستهلك أو وفقاً لمواصفات حدّدها،
                    ويستثنى من ذلك المنتجات التي بها عيب أو التي خالفت المواصفات المحدّدة من قبل المستهلك.</Text>
                <Text style={styles.descriptionBullets}> إذا ظهر عيب في المنتج بسبب سوء حيازة المستهلك.</Text>

                <Text style={styles.descriptionBullets}>
                    6. في حالة توافرت أحكام سياسة الاسترجاع المذكورة؛ يحق للمستهلك فسخ العقد ورد المنتج إلى
                    (شركة بوادر الثقة الدولية المحدودة) مع استرجاع المبلغ المدفوع.</Text>

                <Text style={styles.description}>مدة إعادة الأموال تتم من 5 -7 أيام عمل.</Text>

                <Text style={styles.descriptionHeader}>
                    المادة السابعة عشرة - القانون أو النظام الواجب التطبيق :
                </Text>
                <Text style={styles.description}>
                    اتفاقية الاستخدام هذه محكومة ومصاغة بحسب القوانين والأنظمة والتشريعات المعمول بها والسارية في
                    المملكة العربية السعودية، وهي خاضعة تمامًا وكليًا للأنظمة المعمول بها لدى السلطات في المملكة
                    العربية السعودية.
                    المادة الثامنة عشرة - أحكام عامة:</Text>

                <Text style={styles.descriptionBullets}> في حال إلغاء أي مادة واردة أو بند ورد في اتفاقية الاستخدام هذه أو أن هناك أي
                    مادة واردة أو أي بند وارد في اتفاقية الاستخدام لم يعد نافذًا، فإن مثل هذا الأمر لا يلغي
                    صلاحية باقي المواد والبنود والأحكام الواردة في اتفاقية الاستخدام وتظل سارية حتى إشعار آخر من
                    إدارة (شركة بوادر الثقة الدولية المحدودة).</Text>
                <Text style={styles.descriptionBullets}> اتفاقية الاستخدام هذه - والتي قد تعدل بين حين وآخر بحسب مقتضى الحال - تُشكّل
                    اتفاقية الاستخدام وآلية العمل والتفاهم والاتفاق والتعاقد بين (شركة بوادر الثقة الدولية
                    المحدودة) وبين المستخدم، كما يوافق كلا أطراف هذه الاتفاقية على أن يوضع في عين الاعتبار ما
                    يلي:</Text>

                <Text style={styles.descriptionBullets}>1. إن اللغة العربية هي اللغة المعمول بها عند تفسير أحكام هذه الاتفاقية، أو عند ترجمتها
                    إلى لغة أخرى.</Text>
                <Text style={styles.descriptionBullets}>2. إن جميع الأسعار المعروضة على خدمات أو منتجات (شركة بوادر الثقة الدولية المحدودة) قد
                    تعدّل بين حينٍ وآخر.</Text>
                <Text style={styles.descriptionBullets}>3. إن العروض الترويجية أو التسويقية التي قد يضعها (شركة بوادر الثقة الدولية المحدودة) هي
                    عروض مؤقتة، حيث أنه لـ (شركة بوادر الثقة الدولية المحدودة) الحق في تعديل هذه العروض
                    الترويجية أو التسويقية في أي وقت أو إيقافها.</Text>
                <Text style={styles.descriptionBullets}>4. يلتزم أطراف هذه الاتفاقية بالتعامل فيما بينهم بما لا يخالف القواعد الشرعية والأنظمة
                    والقوانين المعمول بها ذات العلاقة بطبيعة التعامل بين (شركة بوادر الثقة الدولية المحدودة)
                    والمستخدم.</Text>
                <Text style={styles.descriptionBullets}>5. لا تُلغى اتفاقية الاستخدام هذه إلا بموجب قرار يصدر من إدارة (شركة بوادر الثقة الدولية
                    المحدودة).</Text>
                <View style={{ paddingVertical: 20, marginVertical: 20, borderBottomWidth: 1, borderTopWidth: 1, borderColor: 'lightgrey' }}>
                    <Text style={styles.descriptionHeader}>User Agreement Terms and Conditions</Text>

                    <Text style={styles.description}><Text style={{ fontWeight: 'bold' }}>Introduction to the Usage Agreement:</Text></Text>
                    <Text style={styles.description}>
                        Bawader Al Theqah Int'l Ltd. welcomes you, registered in the commercial register No. (4030171404),
                        and informs you that you will find below the terms and conditions governing your use of this store
                        and all the legal effects that result from your use of the services of the store via the Internet
                        through this electronic platform, as the use of any person was for (Bawader Al Theqah Int'l Ltd.)
                        whether he is a consumer of the service or product of the store or otherwise, this is approval and
                        acceptance from him and he is fully qualified considered legally, systematically and legally For
                        all the articles and provisions of this agreement, which is a confirmation of your commitment to its
                        regulations and what was mentioned in it, and this agreement applies to all types of dealing between
                        the user and the store, except for transactions related to personal status and transactions related
                        to the issuance of instruments related to the dispositions contained on the property. This agreement
                        is valid and effective as soon as you agree to it and start registering with (Bawader International
                        Trust Company Ltd.) under Article X of the Saudi Electronic Transactions Law.
                    </Text>

                    <Text style={styles.descriptionHeader}>Article I - Introduction and Definitions:</Text>
                    <Text style={styles.description}>
                        The foregoing above is an integral part of this Agreement, and below are the connotations and definitions
                        of the key terms used in this Agreement:
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        1. (Store) means this term (Bawader International Trust Company Ltd.), and this definition includes all forms
                        of (Bawader International Trust Company Ltd.) on the Internet, whether it is an electronic application,
                        a website on the Internet, or a commercial shop.
                    </Text>
                    <Text style={styles.descriptionBullets}>
                        2. (User) means every consumer who purchases the product or service from the store through his electronic platform.
                    </Text>
                    <Text style={styles.descriptionBullets}>
                        3. (Agreement) means the terms and conditions of this Agreement, which govern and regulate the relationship
                        between the parties to this Agreement.
                    </Text>

                    <Text style={styles.descriptionHeader}>Article II - Legal capacity of the user:</Text>
                    <Text style={styles.descriptionBullets}>
                        1. The user acknowledges that he has a legal capacity considered Sharia and a system to deal with the store,
                        or that he is not less than eighteen years old.
                    </Text>
                    <Text style={styles.descriptionBullets}>
                        2. The user agrees that in the event of a violation of this article, he bears the consequences of this violation in front of third parties.
                    </Text>

                    <Text style={styles.descriptionHeader}>Article III - Nature of the obligation (Gestures of Trust International Co. Ltd.):</Text>
                    <Text style={styles.descriptionBullets}>
                        1. Bawader Trust International Co. Ltd.'s commitment to consumers or users is to provide (service or product).
                    </Text>
                    <Text style={styles.descriptionBullets}>
                        2. (Bawader International Trust Co. Ltd.) may provide other services such as after-sales services or other related services,
                        due to the nature and type of (service or product) required from the user.
                    </Text>

                    <Text style={styles.descriptionHeader}>Article IV - Controls for the use of (Bawader International Trust Company Ltd.):</Text>
                    <Text style={styles.descriptionBullets}>
                        1. The user is obligated to use the electronic platform of (Bawader International Trust Company Ltd.) in accordance
                        with public morals and regulations in force in the Kingdom of Saudi Arabia.
                    </Text>
                    <Text style={styles.descriptionBullets}>
                        2. When purchasing a service or product (Bawader Trust International Co. Ltd.), the user is obligated not to use this
                        service or product in violation of public morals and regulations in force in the Kingdom of Saudi Arabia.
                    </Text>

                    <Text style={styles.descriptionHeader}>Article V - Accounts and Registration Obligations:</Text>
                    <Text style={styles.description}>
                        Once you apply to join the membership of (Bawader International Trust Company Ltd.) as a user, you are obligated to
                        disclose specific information and choose a secret username and password to be used when accessing the services of
                        (Bawader Trust International Company Ltd.). You hereby agree to:
                    </Text>
                    <Text style={styles.descriptionBullets}>
                        1. You are responsible for maintaining the confidentiality of your account information and the confidentiality of your password,
                        and you agree to notify (Bawader International Trust Company Ltd.) immediately of any unauthorized use of your account
                        information with (Bawader International Trust Company Ltd.) or any other breach of your confidential information.
                    </Text>
                    <Text style={styles.descriptionBullets}>
                        2. In no case shall (Bawader International Trust Co. Ltd.) be responsible for any loss that may be caused to you directly
                        or indirectly, morally or materially, as a result of disclosing your username or password information.
                    </Text>
                    <Text style={styles.descriptionBullets}>
                        3. You are obligated to use your account or membership with (Bawader International Trust Company Ltd.) yourself,
                        as you are fully responsible for it, and in the event that someone else uses it, this is a presumption that you have
                        authorized them to use the store in your name and account.
                    </Text>
                    <Text style={styles.descriptionBullets}>
                        4. You are obligated when using (Bawader International Trust Co. Ltd.) to use it with all seriousness and credibility.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        5. You are obligated to disclose true, correct, up-to-date, complete, and legal information about yourself as required during registration with (Bawader International Trust Company Ltd.), and you are obligated to update your data if it changes or needs updating.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        6. (Bawader International Trust Co. Ltd.) is committed to treating your personal information and contact addresses with complete confidentiality.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        7. If (Bawader International Trust Company Ltd.) finds that you have disclosed information that is not true, incorrect, outdated, incomplete, illegal, or contrary to what is stated in the usage agreement, (Bawader International Trust Company Ltd.) has the right to suspend, freeze, or cancel your membership, store, and account on the platform, without prejudice to the rights of (Bawader International Trust Company Ltd.) and its legitimate means to recover its rights and protect the rest of the users.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        8. In the event of non-compliance with any of the above, the management of (Bawader International Trust Company Ltd.) has the right to suspend or cancel your store or membership or block you from accessing the services of (Bawader International Trust Company Ltd.) again.
                    </Text>

                    <Text style={styles.descriptionHeader}>
                        Article VI - Electronic Communications and Official Means of Communication:
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        1. The parties to this Agreement agree that communication shall be made via the e-mail registered on the Platform.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        2. The User agrees that all agreements, advertisements, data, and other communications provided electronically shall take the place of their written counterparts.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        3. The user agrees to the possibility of communicating with him and informing him of any provisions related to this agreement or dealing with him through the management of (Bawader International Trust Company Ltd.).
                    </Text>

                    <Text style={styles.descriptionHeader}>
                        Article VII - Amendments to the Agreement on Use and Fees:
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        1. (Bawader Trust International Co. Ltd.) may notify you of any amendment to this Agreement in accordance with the official means of communication under this Agreement.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        2. In the event of objection to any amendment to the usage agreement, (Bawader International Trust Company Ltd.) hopes that you will stop using its services.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        3. All fees are calculated in Saudi riyals, and the user must pay all fees due on the platform plus any other expenses.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        4. (Bawader International Trust Co. Ltd.) may impose fees on some users, depending on the offers, products, or services they request or the fees or taxes imposed by the state.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        5. (Bawader Trust International Co. Ltd.) reserves the right to add, increase, reduce, or deduct any fees or expenses.
                    </Text>

                    <Text style={styles.descriptionHeader}>
                        Article VIII – Payment and Payment Services for Stores in (Bawader International Trust Company Ltd.):
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        1. (Bawader International Trust Company Ltd.) provides through its partners the payment and payment system which can be done completely online.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        2. (Bawader International Trust Company Ltd.) is obligated to determine the price of the service or product that it offers in its store according to the recognized market value.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        3. (Bawader International Trust Company Ltd.) is obligated to provide invoices, receipt vouchers, and receipt vouchers for all amounts and profits.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        4. (Bawader International Trust Co. Ltd.) is committed to providing the accounting specifications recognized in its online store.
                    </Text>

                    <Text style={styles.descriptionHeader}>
                        Article IX - Your Personal Information and Transaction Details Information:
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        1. The user acknowledges that he grants (Bawader International Trust Company Ltd.) an unlimited, global, permanent, irrevocable, exempt from expenses, and licensed right to use personal information or materials.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        2. The provisions of confidentiality of consumer information are subject to the rules of the "Privacy and Confidentiality of Information Policy."
                    </Text>

                    <Text style={styles.descriptionHeader}>
                        Article X – Intellectual Property:
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        1. The intellectual property rights of (Bawader International Trust Co. Ltd.) are fully owned by (Bawader International Trust Co. Ltd.).
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        2. The user or consumer respects the intellectual property rights of (Bawader International Trust Company Ltd.).
                    </Text>

                    <Text style={styles.descriptionHeader}>
                        Article XI - Liability (Bawader International Trust Co. Ltd.):
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        1. (Bawader International Trust Co. Ltd.) is obligated to conduct its business in accordance with the regulations in force in the Kingdom of Saudi Arabia.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        2. (Bawader Trust International Co. Ltd.) does not bear any claims arising from errors or negligence, whether caused directly, indirectly, accidentally, by the user or by a third party.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        3. (Bawader International Trust Company Ltd.) and its employees, owners, and representatives are obligated to ensure that the product or service is sound, legitimate, and authorized.
                    </Text>

                    <Text style={styles.descriptionHeader}>
                        Article XII – Confidentiality of Information:
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        1. (Bawader Trust International Co. Ltd.) takes standards to protect users and prevent access by unauthorized persons to users' personal information.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        2. You acknowledge as a user that the Internet is not a completely secure medium, and the confidentiality of your personal information cannot be 100% guaranteed.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        3. (Bawader International Trust Co. Ltd.) has no control over the actions of any third party.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        4. You agree that (Bawader International Trust Co. Ltd.) may use your information for providing services.
                    </Text>

                    <Text style={styles.descriptionHeader}>
                        Article XIII - Restriction of Access or Membership:
                    </Text>

                    <Text style={styles.description}>
                        (Bawader International Trust Co. Ltd.) can suspend or cancel the user's membership or restrict the user's access to the platform's services at any time.
                    </Text>

                    <Text style={styles.descriptionHeader}>
                        Article XIV – Shipping Rates:
                    </Text>

                    <Text style={styles.description}>
                        The value of shipping within Jeddah is 200.00 SR and delivery time is 1-2 working days. Shipping to all regions of the Kingdom is 200.00 SAR with delivery in 1-5 working days to major cities. 1.00 SR on every half kilo.
                    </Text>

                    <Text style={styles.descriptionHeader}>
                        Article XV – Replacement Policy:
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        1. The consumer has the right to replace the product within seven days following the date of receipt.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        2. The product must be in proper condition, and the consumer must not have used the product.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        3. The consumer is not entitled to replace the product in specific cases.
                    </Text>

                    <Text style={styles.descriptionHeader}>
                        Article XVI – Refund Policy:
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        1. The consumer has the right to terminate the contract and return the product within seven days following receipt.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        2. The product must be in proper condition, and the consumer must not have used the product.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        3. Return and exchange fees apply after 3 days of delay in returning the shipment.
                    </Text>

                    <Text style={styles.descriptionBullets}>
                        4. The shipping fee for return is 200.00 SR and the replacement fee is 200.00 SAR for orders
                        from within the Kingdom of Saudi Arabia.
                    </Text>
                    {/* Section 5 */}
                    <Text style={styles.descriptionBullets}>5. The consumer is not entitled to return the product in the following cases:</Text>
                    <Text style={styles.descriptionBullets}>
                        - If the product was manufactured at the request of the consumer or according to specifications specified by him,
                        with the exception of products that have a defect or that violate the specifications specified by the consumer.
                    </Text>
                    <Text style={styles.descriptionBullets}>- If a defect appears in the product due to poor consumer possession.</Text>

                    {/* Section 6 */}
                    <Text style={styles.descriptionBullets}>
                        6. In the event that the provisions of the aforementioned return policy are met, the consumer has the right to terminate the contract and
                        return the product to (Bawader International Trust Company Ltd.) with a refund of the amount paid.
                    </Text>
                    <Text style={styles.descriptionBullets}>7. The refund period is 5-7 working days.</Text>

                    {/* Article XVII - Applicable Law */}
                    <Text style={styles.descriptionHeader}>Article XVII - Applicable Law or Regulation:</Text>
                    <Text style={styles.description}>
                        This Usage Agreement is governed and drafted in accordance with the laws, regulations and legislation in force in the Kingdom of Saudi Arabia,
                        and is fully subject to the regulations of the authorities in the Kingdom of Saudi Arabia.
                    </Text>

                    {/* Article XVIII - General Provisions */}
                    <Text style={styles.descriptionHeader}>Article XVIII - General Provisions:</Text>
                    <Text style={styles.descriptionBullets}>
                        - In the event that any article or clause contained in this usage agreement is canceled or that any article contained or any clause contained in
                        the usage agreement is no longer in force, such an order does not cancel the validity of the rest of the articles, terms, and provisions contained
                        in the usage agreement and remains in force until further notice from the management of (Bawader Trust International Co. Ltd.).
                    </Text>
                    <Text style={styles.descriptionBullets}>
                        - This Usage Agreement, which may be amended from time to time as the case may be, constitutes the Employment Agreement, the mechanism of work,
                        the understanding, the agreement and the contract between (Bawader International Trust Company Ltd.) and the User, and both parties to this Agreement
                        agree to take into account the following:
                    </Text>

                    {/* List under Article XVIII */}
                    <Text style={styles.descriptionBullets}>
                        1. Arabic shall be the language applicable when interpreting the provisions of this Agreement or when translating it into another language.
                    </Text>
                    <Text style={styles.descriptionBullets}>
                        2. All prices offered on the services or products of (Bawader Trust International Co. Ltd.) may be amended from time to time.
                    </Text>
                    <Text style={styles.descriptionBullets}>
                        3. The promotional or marketing offers that may be placed by (Bawader International Trust Co. Ltd.) are temporary offers, as (Bawader International Trust
                        Co. Ltd.) has the right to modify or discontinue these promotional or marketing offers at any time.
                    </Text>
                    <Text style={styles.descriptionBullets}>
                        4. The parties to this agreement are obliged to deal with each other in a manner that does not violate the Sharia rules, regulations and laws in force
                        related to the nature of the transaction between (Bawader International Trust Company Ltd.) and the user.
                    </Text>
                    <Text style={styles.descriptionBullets}>
                        5. This usage agreement shall not be canceled except by a decision issued by the management of (Bawader International Trust Co. Ltd.).
                    </Text>
                </View>
                <Button title={'Logout'} onPress={logoutFunc} />
            </View>
            {/* Add more UI elements */}
        </ScrollView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        // padding: 10
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.black
    },
    descriptionHeader: {
        paddingTop: 15,
        fontSize: 17,
        fontWeight: 'bold',
        color: colors.black
    },
    descriptionBullets: {
        fontSize: 16,
        // fontWeight: 'bold',
        color: colors.black
    },
    description: {
        paddingTop: 10,
        fontSize: 16,
        // fontWeight: 'bold',
        color: colors.black
    },
});

export default ResetPasswordScreen;
